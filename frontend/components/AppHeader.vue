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
    get: () => {
        const currLocaleCode = locale.value;
        const currLocale = localeOptionsResolver.find((locale) => locale.code === currLocaleCode);
        if (!currLocale) return 'English';
        return currLocale.name;
    },
    set: (val) => {
        const newLocale = localeOptionsResolver.find((locale) => locale.name === val);
        if (!newLocale) return;
        setLocale(newLocale.code);
    },
});
</script>

<template>
    <v-app-bar :elevation="2" class="px-4">
        <div class="ml-4">
            <v-img class="kli1-logo" :width="36" aspect-ratio="16/9" src="@/assets/img/kli1-logo.svg"></v-img>
        </div>
        <div class="show-me">
            <v-dialog max-width="400" max-height="800" transition="dialog-top-transition">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        color="surface-variant"
                        text="Login / Register"
                        variant="flat"
                    ></v-btn>
                </template>

                <template v-slot="{ isActive }">
                    <Login @close="isActive.value = false" />
                </template>
            </v-dialog>

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
.close-button-container {
    display: flex;
    justify-content: flex-end;
}
.wululu {
    border: 1px solid red;
}
.show-me {
    margin-top: 2rem;
    display: flex;
    gap: 4px;
    /* align-items: center; */
}
.v-toolbar__content {
    display: flex;
    justify-content: space-between;
}
</style>
