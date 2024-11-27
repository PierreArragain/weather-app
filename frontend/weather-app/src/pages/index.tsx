import { Box, Button, Typography } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const handleSelect = (selectedOption: LocationSuggestionDto | null) => {
    if (selectedOption) {
      const { latitude, longitude } = selectedOption;
      router.push(`/weather/${latitude}/${longitude}`);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        checkAuth();
      } else {
        console.error("Error while logging out");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Recherchez un lieu pour obtenir la météo
      </Typography>
      <SearchBar onSelect={handleSelect} />

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/register")}
          sx={{ mr: 2 }}
        >
          S'inscrire
        </Button>
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

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={checkAuth}
      />
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
