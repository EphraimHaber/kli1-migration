// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ['@/assets/scss/main.scss'],
    devtools: { enabled: true },
    // vite: {
    //     css: {
    //         preprocessorOptions: {
    //             scss: {
    //                 api: 'modern-compiler',
    //                 // additionalData: `@import "assets/scss/main.scss";`,
    //             },
    //         },
    //     },
    // },
    modules: ['@nuxt/ui', '@nuxtjs/i18n'],
    // styleResources: {
    // scss: [
    // './assets/*.scss',
    // './assets/abstracts/_mixins.scss', // use underscore "_" & also file extension ".scss"
    // ],
    // },

    routeRules: {
        '/': { redirect: '/en' },
    },
    i18n: {
        locales: [
            {
                code: 'en',
                dir: 'ltr',
                name: 'English',
                file: 'en.json',
            },
            {
                code: 'he',
                dir: 'rtl',
                name: 'Hebrew',
                file: 'he.json',
            },
            {
                code: 'ru',
                dir: 'ltr',
                name: 'Russian',
                file: 'ru.json',
            },
        ],
        langDir: 'locales',
        strategy: 'prefix',
        // vueI18n: './i18n.config.ts',
        detectBrowserLanguage: false,
    },

    compatibilityDate: '2024-09-25',
});
