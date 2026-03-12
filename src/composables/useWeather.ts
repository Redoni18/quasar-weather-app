import { computed, ref } from 'vue';
import type { LocationOption, UnitsSystem, WeatherSnapshot } from 'src/types/weather';

const searchQuery = ref('');
const searchResults = ref<LocationOption[]>([]);
const selectedLocation = ref<LocationOption | null>(null);
const selectedUnits = ref<UnitsSystem>('metric');
const weather = ref<WeatherSnapshot | null>(null);
const errorMessage = ref('');
const isSearching = ref(false);
const isLoadingWeather = ref(false);
const initialized = ref(false);

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload && payload.error
        ? payload.error
        : 'Something went wrong while fetching weather data.';

    throw new Error(message);
  }

  return payload as T;
}

async function loadWeather(location: LocationOption, units = selectedUnits.value) {
  isLoadingWeather.value = true;
  errorMessage.value = '';

  try {
    const params = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lon),
      units,
      name: location.name,
      country: location.country,
    });

    if (location.state) {
      params.set('state', location.state);
    }

    const data = await requestJson<WeatherSnapshot>(`/api/weather/forecast?${params.toString()}`);

    weather.value = data;
    selectedLocation.value = data.location;
  } catch (error) {
    weather.value = null;
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load weather data right now.';
  } finally {
    isLoadingWeather.value = false;
  }
}

async function searchLocations(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    errorMessage.value = 'Enter a city, region, or country to search.';
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  errorMessage.value = '';

  try {
    const params = new URLSearchParams({ q: trimmedQuery, limit: '5' });
    const payload = await requestJson<{ locations: LocationOption[] }>(
      `/api/locations/search?${params.toString()}`,
    );

    searchResults.value = payload.locations;

    if (payload.locations.length === 0) {
      errorMessage.value = 'No locations matched that search. Try a broader name.';
      return;
    }

    if (payload.locations.length === 1) {
      await selectLocation(payload.locations[0] as LocationOption);
    }
  } catch (error) {
    searchResults.value = [];
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to search for locations right now.';
  } finally {
    isSearching.value = false;
  }
}

async function selectLocation(location: LocationOption) {
  searchResults.value = [];
  searchQuery.value = location.label;
  selectedLocation.value = location;
  await loadWeather(location, selectedUnits.value);
}

async function refreshWeather() {
  if (!selectedLocation.value) {
    errorMessage.value = 'Search for a location before refreshing.';
    return;
  }

  await loadWeather(selectedLocation.value, selectedUnits.value);
}

async function setUnits(units: UnitsSystem) {
  if (selectedUnits.value === units) {
    return;
  }

  selectedUnits.value = units;

  if (selectedLocation.value) {
    await loadWeather(selectedLocation.value, units);
  }
}

function initializeWeather() {
  if (initialized.value) {
    return;
  }

  initialized.value = true;
  searchQuery.value = '';
  searchResults.value = [];
  selectedLocation.value = null;
  selectedUnits.value = 'metric';
  weather.value = null;
  errorMessage.value = '';
}

const hasWeather = computed(() => weather.value !== null);
const isBusy = computed(() => isSearching.value || isLoadingWeather.value);

export function useWeather() {
  return {
    searchQuery,
    searchResults,
    selectedLocation,
    selectedUnits,
    weather,
    errorMessage,
    isSearching,
    isLoadingWeather,
    hasWeather,
    isBusy,
    initializeWeather,
    searchLocations,
    selectLocation,
    refreshWeather,
    setUnits,
  };
}
