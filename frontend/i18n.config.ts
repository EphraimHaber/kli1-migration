// i18n.config.ts
import { en, he, ru } from 'vuetify/locale';
export default defineI18nConfig(() => ({
    legacy: false,
    messages: {
        en: {
            $vuetify: en,
        },
        he: {
            $vuetify: he,
        },
        ru: {
            $vuetify: ru,
        },
    },
}));
