import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "../providers/auth-context";
import { LocationProvider } from "../providers/location-context";
import theme from "../theme/theme";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <LocationProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
