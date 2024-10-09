// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    typescript: {
        typeCheck: true,
        strict: true,
    },
    ssr: false,
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.API_BASE_URL || 'https://default-url.com',
        },
    },
    modules: ['vuetify-nuxt-module', '@nuxtjs/i18n'],
    devtools: { enabled: false },
    css: [
        'vuetify/styles',
        'vue3-toastify/dist/index.css',
        'flag-icons/css/flag-icons.min.css',
        'v-phone-input/dist/v-phone-input.css',
    ],
    build: {
        transpile: ['vuetify', 'v-phone-input'],
    },
    imports: {
        autoImport: true,
        injectAtEnd: true,
    },
    vuetify: {
        moduleOptions: {},
        vuetifyOptions: {
            icons: {
                defaultSet: 'mdi',
            },
        },
    },
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
                name: 'עברית',
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
        vueI18n: './i18n.config.ts',
        detectBrowserLanguage: false,
    },
});
