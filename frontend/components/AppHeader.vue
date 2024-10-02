<script setup lang="ts">
const { locale, setLocale } = useI18n();
const localeOptionsResolver = Array.from(useI18n().locales.value).map((locale) => {
    return {
        code: locale.code,
        name: locale.name,
    };
});

const localeOptions = localeOptionsResolver.map((opt) => opt.name);

const selectedLocale = computed({
    get: () => locale.value,
    set: (val) => setLocale(val),
});

const changeLocale = (newLocale: string) => {
    console.log(newLocale);
    setLocale(newLocale).then(() => {
        console.log(locale.value);
    });
};
</script>

<template>
    <v-app-bar :elevation="2" class="px-4">
        <!-- <div class="flex  w-full flex-col"></div> -->
        <div class="ml-4">
            <v-img class="kli1-logo" :width="36" aspect-ratio="16/9" src="@/assets/img/kli1-logo.svg"></v-img>
        </div>

        <!-- {{ $t('app_title') }} -->
        <div class="show-me">
            <v-select
                v-model="selectedLocale"
                :items="localeOptions"
                item-text="name"
                item-value="code"
                density="compact"
            />
        </div>
    </v-app-bar>
</template>

<style>
.show-me {
    margin-top: 2rem;
}
.v-toolbar__content {
    display: flex;
    justify-content: space-between;
}
</style>
