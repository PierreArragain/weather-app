import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";

const ConfirmationPage = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        textAlign: "center",
        maxWidth: 400,
        margin: "auto",
        mt: 5,
        p: 3,
        boxShadow: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        🎉 Bienvenue !
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Votre inscription a bien été effectuée !
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/")}
      >
        Retour à la page d'accueil
      </Button>
    </Box>
  );
};

export default ConfirmationPage;
