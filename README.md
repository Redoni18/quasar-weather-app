# Quasar Weather App

A weather dashboard built with Quasar and Vue that lets users:

- search for a location
- view current conditions plus a concise 5-day forecast
- switch between metric and imperial units
- refresh the selected location on demand

The app uses a small Node/Express proxy so the OpenWeather API key stays on the server instead of being exposed to the browser.

## Tech stack

- Quasar + Vue 3 for the SPA frontend
- Express for the server-side proxy and production hosting
- OpenWeather geocoding, current weather, and 5-day forecast APIs
- Docker for containerized runtime
- GitHub Actions for CI

## Environment variables

Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Required values:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=3000
WEATHER_SERVER_URL=http://localhost:3000
```

Notes:

- `OPENWEATHER_API_KEY` is the preferred variable for the server proxy.
- `.env` is ignored by git and should not be committed.

## Run locally

Install dependencies:

```bash
npm install
```

Start the proxy server in one terminal:

```bash
npm run dev:server
```

Start the Quasar frontend in another terminal:

```bash
npm run dev:client
```

The frontend dev server proxies `/api/*` requests to `http://localhost:3000` by default.

## Production build

Build the Quasar SPA:

```bash
npm run build
```

Serve the built SPA and proxy API together:

```bash
npm run start
```

## Docker

Build the container image:

```bash
docker build -t quasar-weather-app .
```

Run the container:

```bash
docker run --rm -p 3000:3000 -e OPENWEATHER_API_KEY=your_openweather_api_key quasar-weather-app
```

Then open `http://localhost:3000`.

## Scripts

```bash
npm run dev:client   # start the Quasar dev server
npm run dev:server   # start the Express proxy server
npm run lint         # run ESLint
npm run build        # create the production SPA build
npm run start        # serve dist/spa with the proxy API
```

## Architecture

Frontend flow:

1. The user searches for a city or region in the Quasar UI.
2. The frontend calls the local `/api/locations/search` proxy route.
3. After a location is selected, the frontend calls `/api/weather/forecast`.
4. The proxy fetches data from OpenWeather and returns a normalized payload for the UI.
5. The selected location and units are persisted in local storage for convenience.

Server routes:

- `GET /api/health`
- `GET /api/locations/search?q=London&limit=5`
- `GET /api/weather/forecast?lat=51.5073&lon=-0.1276&units=metric`

## CI

GitHub Actions runs the following checks on pushes and pull requests:

- `npm ci`
- `npm run lint`
- `npm run build`
- `docker build`

## OpenWeather docs

The application integrates with OpenWeather current weather and forecast endpoints:

- [OpenWeather Current Weather API](https://openweathermap.org/current?collection=current_forecast)
- [OpenWeather API Platform](https://openweathermap.org/api)
