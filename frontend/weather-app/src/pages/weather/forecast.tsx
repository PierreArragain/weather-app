import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CurrentTodayAndForecastsByDayDto,
  ForecastByDayDto,
  ForecastWeatherTimestamp,
} from "../../types/weather";

const WeatherPage = () => {
  const router = useRouter();
  const { lat, lon } = router.query;

  const [weatherData, setWeather] =
    useState<CurrentTodayAndForecastsByDayDto | null>(null);
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
          <Typography variant="h6">{today.cityName}</Typography>
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
    </Box>
  );
};

export default WeatherPage;
