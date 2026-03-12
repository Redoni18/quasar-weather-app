import { defineConfig } from '#q-app/wrappers';

export default defineConfig(() => {
  return {
    css: ['app.css'],
    extras: [
      'roboto-font',
      'material-icons',
    ],
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: 'history',
      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },
    devServer: {
      open: true,
      proxy: {
        '/api': {
          target: process.env.WEATHER_SERVER_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    framework: {
      config: {},
      plugins: [],
    },
    animations: [],
  };
});
