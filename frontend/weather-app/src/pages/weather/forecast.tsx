import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoginModal from "../../components/login-modal";
import { useAuth } from "../../providers/AuthContext";
import { useLocation } from "../../providers/LocationContext";
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
      if (!selectedLocation) {
        setSelectedLocation({
          id: 0,
          latitude: Array.isArray(lat) ? lat[0] : lat || "",
          longitude: Array.isArray(lon) ? lon[0] : lon || "",
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
    const isFav = favorites.some(
      (favorite) => favorite.latitude === lat && favorite.longitude === lon,
    );
    setIsFavorite(isFav);
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

  useEffect(() => {
    if (authenticated && favorites.length > 0) {
      checkIfFavorite();
    }
  }, [authenticated, favorites]);

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
    <Box p={2}>
      {/* Current forecast */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderRadius={2}
        bgcolor="#e3f2fd"
        p={3}
        mb={2}
      >
        <Box>
          <Box display="flex" alignItems="center">
            <Typography variant="h6">
              {selectedLocation?.localName || today.cityName}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={isFavorite ? handleDeleteLocation : handleSaveLocation}
              sx={{ ml: 2 }}
            >
              {isFavorite
                ? "Supprimer de mes favoris"
                : "Ajouter à mes favoris"}
            </Button>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {Math.round(current.temperature)}°C
          </Typography>
          <Typography variant="subtitle1">{current.description}</Typography>
        </Box>
        <Box>
          <img
            src={`http://openweathermap.org/img/wn/${current.icon}@2x.png`}
            alt="Météo actuelle"
          />
        </Box>
      </Box>

      {/* Today forecast */}
      <Box
        display="flex"
        overflow="auto"
        borderRadius={2}
        bgcolor="#f1f1f1"
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
              <Typography variant="subtitle2">
                {new Date(timestamp.localTime).toLocaleDateString("fr-FR", {
                  weekday: "short",
                })}
              </Typography>
              <Typography variant="subtitle2">
                {new Date(timestamp.localTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                })}
              </Typography>
              <img
                src={`http://openweathermap.org/img/wn/${timestamp.icon}.png`}
                alt={timestamp.description}
              />
              <Typography variant="body2">
                {Math.round(timestamp.temperature)}°C
              </Typography>
            </Box>
          ),
        )}
      </Box>

      {/* Forecasts */}
      <Box
        display="flex"
        overflow="auto"
        borderRadius={2}
        bgcolor="#f1f1f1"
        p={2}
      >
        {forecasts.map((forecast: ForecastByDayDto, index: number) => (
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
            <Typography variant="subtitle2">{forecast.weekDay}</Typography>
            <Typography variant="subtitle2">
              {new Date(forecast.fullDate).toLocaleDateString("fr-FR", {
                day: "numeric",
              })}
            </Typography>
            <img
              src={`http://openweathermap.org/img/wn/${forecast.weatherSummary.icon}.png`}
              alt={forecast.weatherSummary.description}
            />
            <Typography variant="body2">
              {Math.round(forecast.maxTemp)}°C
            </Typography>
            <Typography variant="body2">
              {Math.round(forecast.minTemp)}°C
            </Typography>
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
  );
};

export default WeatherPage;
