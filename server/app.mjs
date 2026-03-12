import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist', 'spa');
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

function clampLimit(limit) {
  const value = Number(limit || '5');

  if (Number.isNaN(value)) {
    return 5;
  }

  return Math.max(1, Math.min(value, 5));
}

function formatLocationLabel(location) {
  return [location.name, location.state, location.country].filter(Boolean).join(', ');
}

function formatDayLabel(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp * 1000));
}

function selectDailyEntry(entries) {
  return entries.reduce((closest, entry) => {
    const currentDistance = Math.abs(new Date(entry.dt * 1000).getHours() - 12);
    const bestDistance = Math.abs(new Date(closest.dt * 1000).getHours() - 12);
    return currentDistance < bestDistance ? entry : closest;
  });
}

function normalizeForecast(current, forecast) {
  const currentDay = new Date(current.dt * 1000).toISOString().slice(0, 10);
  const groupedByDay = new Map();

  for (const item of forecast.list || []) {
    const dayKey = new Date(item.dt * 1000).toISOString().slice(0, 10);

    if (dayKey === currentDay) {
      continue;
    }

    if (!groupedByDay.has(dayKey)) {
      groupedByDay.set(dayKey, []);
    }

    groupedByDay.get(dayKey).push(item);
  }

  return Array.from(groupedByDay.values())
    .slice(0, 5)
    .map((entries) => {
      const selectedEntry = selectDailyEntry(entries);
      const weather = selectedEntry.weather?.[0] || {};

      return {
        timestamp: selectedEntry.dt,
        dateLabel: formatDayLabel(selectedEntry.dt),
        temp: selectedEntry.main?.temp ?? 0,
        tempMin: selectedEntry.main?.temp_min ?? selectedEntry.main?.temp ?? 0,
        tempMax: selectedEntry.main?.temp_max ?? selectedEntry.main?.temp ?? 0,
        description: weather.description || 'Unavailable',
        condition: weather.main || 'Unknown',
        icon: weather.icon || '01d',
        humidity: selectedEntry.main?.humidity ?? 0,
        windSpeed: selectedEntry.wind?.speed ?? 0,
        precipitationChance: Math.round((selectedEntry.pop ?? 0) * 100),
      };
    });
}

async function fetchOpenWeather(endpoint, params) {
  if (!openWeatherApiKey) {
    const error = new Error('OpenWeather API key is missing.');
    error.statusCode = 500;
    throw error;
  }

  const url = new URL(endpoint, 'https://api.openweathermap.org');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set('appid', openWeatherApiKey);

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(body || 'Failed to reach OpenWeather.');
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

export function createApp() {
  const app = express();

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.get('/api/locations/search', async (request, response) => {
    const query = String(request.query.q || '').trim();

    if (!query) {
      response.status(400).json({ error: 'Search query is required.' });
      return;
    }

    try {
      const locations = await fetchOpenWeather('/geo/1.0/direct', {
        q: query,
        limit: clampLimit(request.query.limit),
      });

      const normalizedLocations = locations.map((location) => ({
        name: location.name,
        state: location.state,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
        label: formatLocationLabel(location),
      }));

      response.json({ locations: normalizedLocations });
    } catch (error) {
      response.status(error.statusCode || 500).json({
        error: error instanceof Error ? error.message : 'Unable to search locations.',
      });
    }
  });

  app.get('/api/weather/forecast', async (request, response) => {
    const lat = Number(request.query.lat);
    const lon = Number(request.query.lon);
    const units = request.query.units === 'imperial' ? 'imperial' : 'metric';

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      response.status(400).json({ error: 'Latitude and longitude are required.' });
      return;
    }

    try {
      const [current, forecast] = await Promise.all([
        fetchOpenWeather('/data/2.5/weather', { lat, lon, units }),
        fetchOpenWeather('/data/2.5/forecast', { lat, lon, units }),
      ]);

      const currentWeather = current.weather?.[0] || {};
      const location = {
        name: String(request.query.name || current.name || 'Selected location'),
        state: String(request.query.state || ''),
        country: String(request.query.country || current.sys?.country || ''),
        lat,
        lon,
      };

      response.json({
        location: {
          ...location,
          label: formatLocationLabel(location),
        },
        units,
        current: {
          temperature: current.main?.temp ?? 0,
          feelsLike: current.main?.feels_like ?? 0,
          tempMin: current.main?.temp_min ?? current.main?.temp ?? 0,
          tempMax: current.main?.temp_max ?? current.main?.temp ?? 0,
          humidity: current.main?.humidity ?? 0,
          pressure: current.main?.pressure ?? 0,
          windSpeed: current.wind?.speed ?? 0,
          windDeg: current.wind?.deg ?? 0,
          clouds: current.clouds?.all ?? 0,
          visibility: current.visibility ?? 0,
          description: currentWeather.description || 'Unavailable',
          condition: currentWeather.main || 'Unknown',
          icon: currentWeather.icon || '01d',
          sunrise: current.sys?.sunrise ?? current.dt,
          sunset: current.sys?.sunset ?? current.dt,
          updatedAt: current.dt,
        },
        forecast: normalizeForecast(current, forecast),
      });
    } catch (error) {
      response.status(error.statusCode || 500).json({
        error: error instanceof Error ? error.message : 'Unable to fetch forecast.',
      });
    }
  });

  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    app.use(express.static(distDir));

    app.get(/^(?!\/api).*/, (_request, response) => {
      response.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    app.get('/', (_request, response) => {
      response.json({
        message: 'Weather API server is running. Build the Quasar app to serve the frontend here.',
      });
    });
  }

  return app;
}

export function startServer(port = Number(process.env.PORT || '3000')) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Weather server listening on http://localhost:${port}`);
  });
}
