<template :dir="$i18n.localeProperties.dir">
    <NuxtLayout>
        <AppHeader />
        <div style="min-height: 80dvh" class="px-2">
            <NuxtPage />
        </div>
        <AppFooter />
    </NuxtLayout>
</template>
