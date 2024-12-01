# Weather App

This is a simple weather app that uses the OpenWeatherMap API to get the weather data for a given city. The app is built using NestJS, NextJS with Material UI, TypeScript, and Postgres.

## Installation

App can be installed and launched via Docker. To do so, run the following command:

```bash
docker-compose up -d
```

This will build the Docker image and run the app on port 4200. You can access the app by navigating to `http://localhost:4200` in your browser.

## External APIs

The app uses two external API :

- Nominatim - OpenStreetMap API to get the latitude and longitude of a given city. No API key required : https://nominatim.openstreetmap.org/search
- OpenWeatherMap - API to get the weather data for a given latitude and longitude. The app works with a free tier API key, available here: https://home.openweathermap.org/users/sign_up
