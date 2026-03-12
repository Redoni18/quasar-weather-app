<template>
  <q-layout view="lHh Lpr lFf" class="min-h-screen text-slate-900 weather-app-body">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.weather-app-body {
  background:
    radial-gradient(circle at top, rgba(118, 169, 255, 0.28), transparent 32%),
    linear-gradient(180deg, #f4f8fc 0%, #eef3f9 100%);
}
</style>
