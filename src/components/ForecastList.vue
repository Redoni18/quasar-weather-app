<template>
  <q-card flat bordered class="border-slate-200 bg-white/90 shadow-sm backdrop-blur">
    <q-card-section class="flex flex-col gap-1">
      <div class="text-xl font-semibold text-slate-900">5-day forecast</div>
      <div class="text-sm text-slate-500">A quick daily view for your selected location</div>
    </q-card-section>

    <q-separator class="bg-slate-200" />

    <q-card-section>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        <article
          v-for="entry in forecast"
          :key="entry.timestamp"
          class="flex min-h-full flex-col items-center rounded-2xl border border-slate-200 bg-slate-200 px-4 py-4 text-center"
        >
          <div class="font-bold text-slate-900">{{ entry.dateLabel }}</div>
          <img :src="iconUrl(entry.icon)" :alt="entry.description" class="h-[68px] w-[68px]" />
          <div class="mb-3 min-h-11 capitalize text-slate-600">{{ entry.description }}</div>
          <div class="text-lg font-bold text-slate-900">
            {{ Math.round(entry.tempMax) }}&deg;{{ temperatureUnit }}
            <span class="ml-1 text-base font-semibold text-slate-500">
              {{ Math.round(entry.tempMin) }}&deg;
            </span>
          </div>
          <div class="mt-1.5 text-sm text-slate-500">
            Rain chance {{ Math.round(entry.precipitationChance) }}%
          </div>
          <div class="mt-1.5 text-sm text-slate-500">
            Wind {{ entry.windSpeed.toFixed(1) }} {{ windUnit }}
          </div>
        </article>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ForecastItem, UnitsSystem } from 'src/types/weather';

const props = defineProps<{
  forecast: ForecastItem[];
  units: UnitsSystem;
}>();

const temperatureUnit = computed(() => (props.units === 'metric' ? 'C' : 'F'));
const windUnit = computed(() => (props.units === 'metric' ? 'm/s' : 'mph'));

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
</script>
