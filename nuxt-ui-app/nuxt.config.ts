// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@nuxt/ui', '@nuxtjs/i18n'],

    routeRules: {
        '/': { redirect: '/en-US' },
    },
    i18n: {
        locales: [
            {
                code: 'en-US',
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
