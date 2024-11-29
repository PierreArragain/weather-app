import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useAuth } from "../providers/auth-context";

export const AuthActions = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const { authenticated, checkAuth } = useAuth();
  const router = useRouter();

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

  if (authenticated) {
    return (
      <Button variant="outlined" color="primary" onClick={handleLogout}>
        Me déconnecter
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/register")}
        sx={{ mr: 2 }}
      >
        S'inscrire
      </Button>
      <Button variant="outlined" color="primary" onClick={() => onLoginClick()}>
        Me connecter
      </Button>
    </>
  );
};
