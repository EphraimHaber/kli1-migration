<template :dir="$i18n.localeProperties.dir">
    <UContainer>
        <UCard class="mt-10">
            <template #header>
                <div class="flex justify-between">
                    <ColorScheme
                        ><USelect v-model="$colorMode.preference" :options="['system', 'light', 'dark']"
                    /></ColorScheme>
                </div>
            </template>
            <UButton icon="i-heroicons-book-open" to="https://ui.nuxt.com" target="_blank"
                >Open Nuxt UI Documentation</UButton
            >
        </UCard>
    </UContainer>
    <NuxtPage />
</template>
