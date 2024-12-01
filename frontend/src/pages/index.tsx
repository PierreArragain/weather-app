import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import background from "../../public/7280763.jpg";
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
      p={3}
      maxWidth={1024}
      minHeight={"100vh"}
      margin={"auto"}
      sx={{
        backgroundImage: `url('${background.src}')`,
        backgroundSize: "cover",
      }}
    >
      <Box borderRadius={2} mb={2} p={2} bgcolor={"#ffffff"}>
        <Typography fontSize="2rem" variant="h4" gutterBottom>
          Quel temps fait-il ?
        </Typography>
        <Box mb={2}>
          <SearchBar onSelect={handleSelect} />
        </Box>

        {authenticated && favorites.length > 0 && (
          <FavoriteList favorites={favorites} onSelect={handleSelect} />
        )}
        <Box textAlign={"center"} mt={4}>
          <AuthActions onLoginClick={() => setLoginModalOpen(true)} />
        </Box>
      </Box>

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
