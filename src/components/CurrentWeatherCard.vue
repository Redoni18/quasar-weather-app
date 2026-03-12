<template>
  <q-card flat bordered class="border-slate-200 bg-white/90 shadow-sm backdrop-blur">
    <q-card-section
      class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div>
        <div class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          Current conditions
        </div>
        <div class="mt-1.5 text-[1.6rem] font-bold leading-tight text-slate-900">
          {{ locationLabel }}
        </div>
        <div class="mt-1.5 text-base capitalize text-slate-600">{{ weather.description }}</div>
      </div>

      <div class="flex items-center gap-2">
        <img :src="iconUrl" :alt="weather.description" class="h-[72px] w-[72px]" />
        <div class="text-[2.5rem] font-bold leading-none text-slate-900">
          {{ roundedTemperature }}&deg;{{ temperatureUnit }}
        </div>
      </div>
    </q-card-section>

    <q-separator class="bg-slate-200" />

    <q-card-section class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Feels like</span>
        <strong>{{ Math.round(weather.feelsLike) }}&deg;{{ temperatureUnit }}</strong>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Daily range</span>
        <strong>{{ Math.round(weather.tempMin) }}&deg; / {{ Math.round(weather.tempMax) }}&deg;</strong>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Humidity</span>
        <strong>{{ weather.humidity }}%</strong>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Wind</span>
        <strong>{{ weather.windSpeed.toFixed(1) }} {{ windUnit }}</strong>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Visibility</span>
        <strong>{{ visibilityLabel }}</strong>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase text-slate-500">Updated</span>
        <strong>{{ updatedLabel }}</strong>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CurrentWeather, UnitsSystem } from 'src/types/weather';

const props = defineProps<{
  weather: CurrentWeather;
  locationLabel: string;
  units: UnitsSystem;
}>();

const temperatureUnit = computed(() => (props.units === 'metric' ? 'C' : 'F'));
const windUnit = computed(() => (props.units === 'metric' ? 'm/s' : 'mph'));
const roundedTemperature = computed(() => Math.round(props.weather.temperature));
const iconUrl = computed(
  () => `https://openweathermap.org/img/wn/${props.weather.icon}@2x.png`,
);

const visibilityLabel = computed(() => {
  const divisor = props.units === 'metric' ? 1000 : 1609.34;
  const suffix = props.units === 'metric' ? 'km' : 'mi';
  return `${(props.weather.visibility / divisor).toFixed(1)} ${suffix}`;
});

const updatedLabel = computed(() =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(props.weather.updatedAt * 1000)),
);
</script>
