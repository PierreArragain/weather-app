import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

const RegisterPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Error during registration");
      }

      router.push("/confirmation");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during registration",
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 5, p: 3, boxShadow: 2 }}>
      <Typography variant="h4" gutterBottom>
        Inscription
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Mot de passe"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        sx={{ mt: 2 }}
      >
        S'inscrire
      </Button>
    </Box>
  );
};

export default RegisterPage;
