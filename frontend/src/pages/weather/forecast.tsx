import { Favorite, FavoriteBorder } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoginModal from "../../components/login-modal";
import SearchBar from "../../components/search-bar";
import { useAuth } from "../../providers/auth-context";
import { useLocation } from "../../providers/location-context";
import {
  CurrentTodayAndForecastsByDayDto,
  ForecastByDayDto,
  ForecastWeatherTimestamp,
} from "../../types/weather";

const WeatherPage = () => {
  const router = useRouter();
  const { lat, lon } = router.query;
  const {
    selectedLocation,
    setSelectedLocation,
    favorites,
    addFavorite,
    removeFavorite,
    handleSelect,
  } = useLocation();
  const { authenticated, checkAuth } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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

  const [weatherData, setWeather] =
    useState<CurrentTodayAndForecastsByDayDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const locale = typeof window !== "undefined" ? navigator.language : "en";
      const response = await fetch(
        `/api/weather/forecast?lat=${lat}&lon=${lon}&locale=${
          locale.split("-")[0]
        }`,
      );

      const data = await response.json();
      setWeather(data);
      checkIfFavorite();
      if (!selectedLocation) {
        setSelectedLocation({
          id: 0,
          latitude: Array.isArray(lat) ? lat[0] : (lat ?? ""),
          longitude: Array.isArray(lon) ? lon[0] : (lon ?? ""),
          localName: data.today.cityName,
          name: data.today.cityName,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
    setLoading(false);
  };

  const checkIfFavorite = () => {
    if (authenticated && favorites.length > 0) {
      const isFav = favorites.some(
        (favorite) => favorite.latitude === lat && favorite.longitude === lon,
      );
      setIsFavorite(isFav);
    }
  };

  const handleSaveLocation = async () => {
    if (selectedLocation) {
      if (!authenticated) {
        setLoginModalOpen(true);
        return;
      }

      try {
        const response = await fetch("/api/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(selectedLocation),
        });

        if (!response.ok) {
          throw new Error("Error while saving location");
        }

        addFavorite(selectedLocation);
        setIsFavorite(true);
        triggerSnackbar("Lieu ajouté à vos favoris", "success");
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  const handleDeleteLocation = async () => {
    if (selectedLocation) {
      try {
        const response = await fetch(`/api/location/${lat}/${lon}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error while deleting location");
        }

        removeFavorite(selectedLocation);
        setIsFavorite(false);
        triggerSnackbar("Lieu supprimé de vos favoris", "success");
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  useEffect(() => {
    if (router.isReady && lat && lon) {
      fetchWeather();
    }
  }, [lat, lon, router.isReady]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!weatherData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">
          Impossible de charger les données météo.
        </Typography>
      </Box>
    );
  }

  const { current, today, forecasts }: CurrentTodayAndForecastsByDayDto =
    weatherData;

  return (
    <Box maxWidth={1024} margin={"auto"}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
      >
        <Box mr={2}>
          <IconButton onClick={() => router.push("/")}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <SearchBar onSelect={handleSelect} />
      </Box>

      <Box p={2}>
        {/* Current forecast */}
        <Box
          justifyContent="space-between"
          alignItems="center"
          borderRadius={2}
          bgcolor="#e3f2fd"
          p={3}
          mb={2}
        >
          <Box display="flex">
            <Typography alignContent="center" variant="h6">
              {selectedLocation?.localName || today.cityName}
            </Typography>
            <Box alignItems="center">
              {isFavorite ? (
                <IconButton
                  aria-label="Retirer des favoris"
                  color="primary"
                  onClick={handleDeleteLocation}
                  sx={{ ml: 2 }}
                  title="Retirer des favoris"
                >
                  <Favorite />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="Ajouter aux favoris"
                  color="primary"
                  onClick={handleSaveLocation}
                  sx={{ ml: 2 }}
                  title="Ajouter aux favoris"
                >
                  <FavoriteBorder />
                </IconButton>
              )}
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {Math.round(current.temperature)}°C
              </Typography>
              <Typography variant="subtitle1">{current.description}</Typography>
            </Box>
            <Box>
              <Image
                width={100}
                height={100}
                src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
                alt={"Météo actuelle : " + current.description}
                title={current.description}
              />
            </Box>
          </Box>
        </Box>

        {/* Today forecast */}
        <Box borderRadius={2} bgcolor="#f1f1f1" mb={2}>
          <Typography variant="h6" pl={2} pt={2}>
            Prévisions pour aujourd'hui
          </Typography>

          <Box
            display="flex"
            overflow="auto"
            justifyContent="space-evenly"
            p={2}
          >
            {today.timestamps.map(
              (timestamp: ForecastWeatherTimestamp, index: number) => (
                <Box
                  key={index}
                  flex="0 0 auto"
                  textAlign="center"
                  mx={1}
                  p={2}
                  borderRadius={1}
                  bgcolor="white"
                  boxShadow={1}
                  minWidth={100}
                >
                  <Typography variant="subtitle2" fontSize="1.2rem">
                    {new Date(timestamp.localTime).toLocaleDateString("fr-FR", {
                      weekday: "short",
                    })}
                  </Typography>
                  <Typography variant="subtitle2" fontSize="1.2rem">
                    {new Date(timestamp.localTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                    })}
                  </Typography>
                  <Image
                    width={100}
                    height={100}
                    src={`https://openweathermap.org/img/wn/${timestamp.icon}@2x.png`}
                    alt={timestamp.description}
                    title={timestamp.description}
                  />
                  <Typography variant="body2" fontSize="1.2rem">
                    {Math.round(timestamp.temperature)}°C
                  </Typography>
                </Box>
              ),
            )}
          </Box>
        </Box>

        {/* Forecasts */}
        <Box borderRadius={2} bgcolor="#f1f1f1" mb={2}>
          <Typography variant="h6" pl={2} pt={2}>
            Prévisions pour les prochains jours
          </Typography>

          <Box overflow="auto" p={2}>
            {forecasts.map((forecast: ForecastByDayDto, index: number) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
                mx={1}
                p={2}
                mb={2}
                borderRadius={1}
                bgcolor="white"
                boxShadow={1}
                minWidth={300}
              >
                <Box
                  width="37%"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Typography fontSize="1.1rem" variant="subtitle2">
                    {forecast.weekDay.charAt(0).toUpperCase() +
                      forecast.weekDay.slice(1)}{" "}
                    {forecast.numberDay}
                  </Typography>
                </Box>
                <Box
                  width="24%"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    width={75}
                    height={75}
                    src={`https://openweathermap.org/img/wn/${forecast.weatherSummary.icon}@2x.png`}
                    alt={forecast.weatherSummary.description}
                    title={forecast.weatherSummary.description}
                  />
                </Box>
                <Box
                  width="37%"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" fontSize="1.1rem">
                    {Math.round(forecast.minTemp)}°C /{" "}
                    {Math.round(forecast.maxTemp)}°C
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
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
      </Box>
    </Box>
  );
};

export default WeatherPage;
