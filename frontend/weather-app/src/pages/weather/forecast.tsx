import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CurrentAndForecastWeatherDto } from "../../types/weather";

const WeatherPage = () => {
  const router = useRouter();
  const { lat, lon } = router.query;

  const [weatherData, setWeather] =
    useState<CurrentAndForecastWeatherDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!lat || !lon) {
        return;
      }

      const locale = typeof window !== "undefined" ? navigator.language : "en";
      const response = await fetch(
        `/api/weather/forecast?lat=${lat}&lon=${lon}&locale=${
          locale.split("-")[0]
        }`,
      );

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady && lat && lon) {
      fetchWeather();
    }
  }, [lat, lon]);

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

  const { current, forecast } = weatherData;
  return (
    <Box p={2}>
      {/* Météo actuelle */}
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

      {/* Prévisions défilantes */}
      <Box
        display="flex"
        overflow="auto"
        borderRadius={2}
        bgcolor="#f1f1f1"
        p={2}
      >
        {forecast.forecast.map((day, index) => (
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
              {new Date(day.UTCtime).toLocaleDateString("fr-FR", {
                weekday: "short",
              })}
            </Typography>
            <img
              src={`http://openweathermap.org/img/wn/${day.icon}.png`}
              alt={day.description}
            />
            <Typography variant="body2">
              {Math.round(day.tempMin)}°C / {Math.round(day.tempMax)}°C
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WeatherPage;
