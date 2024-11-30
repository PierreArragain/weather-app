import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { AuthActions } from "../components/auth-actions";
import FavoriteList from "../components/favorite-list";
import LoginModal from "../components/login-modal";
import SearchBar from "../components/search-bar";
import { useSnackbar } from "../hooks/useSnackbar";
import { useAuth } from "../providers/auth-context";
import { useLocation } from "../providers/location-context";
import { LocationSuggestionDto } from "../types/location";

interface HomeProps {
  initialData?: LocationSuggestionDto[];
}

export default function Home() {
  const router = useRouter();
  const { authenticated, checkAuth } = useAuth();
  const { favorites, fetchFavorites, handleSelect } = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    triggerSnackbar,
    handleSnackbarClose,
  } = useSnackbar();

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 400,
        margin: "auto",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Recherchez un lieu pour obtenir la météo
      </Typography>
      <SearchBar onSelect={handleSelect} />
      {authenticated && favorites.length > 0 && (
        <FavoriteList favorites={favorites} onSelect={handleSelect} />
      )}
      <AuthActions onLoginClick={() => setLoginModalOpen(true)} />
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={() => {
          triggerSnackbar("Connexion réussie", "success");
          checkAuth();
          fetchFavorites();
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookies = context.req.headers.cookie || "";
  const jwtToken = cookies
    .split("; ")
    .find((cookie) => cookie.startsWith("jwtToken="))
    ?.split("=")[1];

  let authenticated = false;
  let email = null;

  if (jwtToken) {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/user/auth/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        authenticated = data.authenticated;
        email = data.email;
      }
    } catch (error) {
      console.error("Error while checking authentication status:", error);
    }
  }

  return {
    props: {
      authenticated,
      email,
    },
  };
}
