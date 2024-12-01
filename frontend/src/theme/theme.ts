import { createTheme } from "@mui/material/styles";
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

const theme = createTheme({
  typography: {
    fontFamily: lexend.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff4081",
    },
  },
});

export default theme;
