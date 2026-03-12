<template>
  <q-page class="px-4 py-8 md:px-6 md:py-12">
    <div class="mx-auto grid w-full max-w-[1100px] gap-6">
      <section class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="max-w-[700px]">
          <div class="mb-3 text-base font-bold uppercase tracking-[0.08em] text-blue-700">
            Forecast dashboard
          </div>
          <h1 class="text-6xl! font-bold text-slate-900">Look up weather for any location.</h1>
          <p class="mt-4! text-base text-slate-600">
            Search cities around the world, switch between metric and imperial units, and refresh
            the latest forecast without leaving the page.
          </p>
        </div>

        <div class="flex min-w-0 flex-col gap-3 md:min-w-[220px]">
          <q-btn-toggle
            :model-value="selectedUnits"
            spread
            unelevated
            rounded
            toggle-color="primary"
            :options="unitOptions"
            class="w-full overflow-hidden rounded-full border border-slate-200 bg-white/90 shadow-sm"
            @update:model-value="onUnitsChange"
          />

          <q-btn
            color="primary"
            icon="refresh"
            label="Refresh"
            no-caps
            :disable="!selectedLocation"
            :loading="isLoadingWeather"
            class="self-start w-full!"
            @click="onRefresh"
          />
        </div>
      </section>

      <q-card flat bordered class="border-slate-200 bg-white/90 shadow-sm backdrop-blur">
        <q-card-section>
          <div class="text-xl font-semibold text-slate-900">Search location</div>
          <div class="mt-1.5 text-sm text-slate-500">
            Try a city, state, or country. Single matches load instantly, while close matches can be
            selected below.
          </div>
        </q-card-section>

        <q-separator class="bg-slate-200" />

        <q-card-section>
          <q-form
            class="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"
            @submit.prevent="onSearch"
          >
            <q-input
              v-model="searchQuery"
              outlined
              dense
              label="City, region, or country"
              autocomplete="off"
              :disable="isBusy"
              class="rounded-xl"
            >
              <template #append>
                <q-icon name="place" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              color="primary"
              label="Search"
              no-caps
              :loading="isSearching"
              :disable="isBusy"
              class="sm:self-stretch"
            />
          </q-form>
        </q-card-section>

        <q-slide-transition>
          <q-list v-if="searchResults.length > 1" separator class="bg-slate-50/90">
            <q-item-label
              header
              class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
            >
              Choose a location
            </q-item-label>
            <q-item
              v-for="location in searchResults"
              :key="location.label"
              clickable
              class="transition-colors hover:bg-slate-100"
              @click="onLocationSelect(location)"
            >
              <q-item-section avatar>
                <q-icon name="travel_explore" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ location.label }}</q-item-label>
                <q-item-label caption>
                  {{ location.lat.toFixed(2) }}, {{ location.lon.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-slide-transition>
      </q-card>

      <q-banner
        v-if="errorMessage"
        rounded
        inline-actions
        class="rounded-2xl bg-negative text-white"
      >
        {{ errorMessage }}
      </q-banner>

      <div v-if="isLoadingWeather" class="grid gap-4">
        <q-skeleton class="h-[220px] rounded-[24px]" type="rect" />
        <q-skeleton class="h-[220px] rounded-[24px]" type="rect" />
      </div>

      <template v-else-if="weather">
        <CurrentWeatherCard
          :weather="weather.current"
          :location-label="weather.location.label"
          :units="selectedUnits"
        />

        <ForecastList :forecast="weather.forecast" :units="selectedUnits" />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import CurrentWeatherCard from 'src/components/CurrentWeatherCard.vue';
import ForecastList from 'src/components/ForecastList.vue';
import { useWeather } from 'src/composables/useWeather';
import type { LocationOption, UnitsSystem } from 'src/types/weather';

const unitOptions = [
  { label: 'Metric', value: 'metric' },
  { label: 'Imperial', value: 'imperial' },
];

const {
  searchQuery,
  searchResults,
  selectedLocation,
  selectedUnits,
  weather,
  errorMessage,
  isSearching,
  isLoadingWeather,
  isBusy,
  initializeWeather,
  searchLocations,
  selectLocation,
  refreshWeather,
  setUnits,
} = useWeather();

async function onSearch() {
  await searchLocations(searchQuery.value);
}

async function onLocationSelect(location: LocationOption) {
  await selectLocation(location);
}

async function onRefresh() {
  await refreshWeather();
}

async function onUnitsChange(value: string | number | null) {
  if (value !== 'metric' && value !== 'imperial') {
    return;
  }

  await setUnits(value as UnitsSystem);
}

onMounted(() => {
  void initializeWeather();
});
</script>
