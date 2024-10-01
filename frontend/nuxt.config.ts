// https://nuxt.com/docs/api/configuration/nuxt-config
// import { aliases, mdi } from "vuetify/iconsets/mdi";
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  modules: ["vuetify-nuxt-module", "@nuxtjs/i18n"],
  devtools: { enabled: true },
  css: ["vuetify/styles"],
  build: {
    transpile: ["vuetify"],
  },
  imports: {
    autoImport: true,
    injectAtEnd: true,
  },
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      icons: {
        defaultSet: "mdi",
      },
    },
  },
  routeRules: {
    "/": { redirect: "/en" },
  },
  i18n: {
    locales: [
      {
        code: "en",
        dir: "ltr",
        name: "English",
        file: "en.json",
      },
      {
        code: "he",
        dir: "rtl",
        name: "Hebrew",
        file: "he.json",
      },
      {
        code: "ru",
        dir: "ltr",
        name: "Russian",
        file: "ru.json",
      },
    ],
    langDir: "locales",
    strategy: "prefix",
    // vueI18n: './i18n.config.ts',
    detectBrowserLanguage: false,
  },
});
