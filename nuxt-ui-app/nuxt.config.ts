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
            },
            {
                code: 'he',
                dir: 'rtl',
                name: 'Hebrew',
            },
        ],

        strategy: 'prefix',
        vueI18n: './i18n.config.ts',

        detectBrowserLanguage: false,
    },

    compatibilityDate: '2024-09-25',
});
