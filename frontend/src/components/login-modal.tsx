import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal = ({ open, onClose, onLogin }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await fetch("/api/user/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error during login");
      }

      const data = await response.json();
      if (data.token) {
        document.cookie = `jwtToken=${data.token}; path=/;`;
        onLogin();
        onClose();
      } else {
        throw new Error("Unvalid credentials");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          margin: "auto",
          mt: "10%",
          p: 3,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Connexion
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
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Se connecter
        </Button>
      </Box>
    </Modal>
  );
};

export default LoginModal;
