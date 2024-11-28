import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoginModal from "../components/login-modal";
import SearchBar from "../components/search-bar";
import { useAuth } from "../providers/AuthContext";
import { LocationSuggestionDto } from "../types/location";

interface HomeProps {
  initialData?: LocationSuggestionDto[];
}

export default function Home() {
  const router = useRouter();
  const { authenticated, checkAuth } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<LocationSuggestionDto[]>([]);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  // Snackbar helpers
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSelect = (selectedOption: LocationSuggestionDto | null) => {
    if (selectedOption) {
      const { latitude, longitude } = selectedOption;
      router.push(`/weather/forecast?lat=${latitude}&lon=${longitude}`);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        triggerSnackbar("Déconnexion réussie", "success");
        checkAuth();
      } else {
        triggerSnackbar("Erreur lors de la déconnexion", "error");
        console.error("Error while logging out");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    const getUserListOfFavorites = async () => {
      try {
        const response = await fetch("/api/location/user-favorites", {
          credentials: "include",
        });

        if (response.ok) {
          const data: LocationSuggestionDto[] = await response.json();
          setFavorites(data);
        } else {
          console.error("Error while fetching user favorites");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };

    if (authenticated) {
      getUserListOfFavorites();
    }
  }, [authenticated]);

  return (
    <Box sx={{ p: 3, maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Recherchez un lieu pour obtenir la météo
      </Typography>
      <SearchBar onSelect={handleSelect} />

      <Box sx={{ mt: 3 }}>
        {authenticated ? (
          <></>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/register")}
            sx={{ mr: 2 }}
          >
            S'inscrire
          </Button>
        )}
        {authenticated ? (
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Me déconnecter
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setLoginModalOpen(true)}
          >
            Me connecter
          </Button>
        )}
      </Box>

      {authenticated && favorites.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vos lieux favoris
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", padding: 0 }}>
            {favorites.map((favorite) => (
              <Box component="li" key={favorite.name} sx={{ mb: 1 }}>
                <Button variant="text" onClick={() => handleSelect(favorite)}>
                  {favorite.name}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={() => {
          triggerSnackbar("Connexion réussie", "success");
          checkAuth();
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
