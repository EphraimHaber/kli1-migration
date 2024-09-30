<script setup lang="ts">
const route = useRoute();
</script>
<template>
    <div :dir="$i18n.localeProperties.dir">
        <!-- <h1>Nuxt Routing set up successfully!</h1> -->
        <!-- <p>Current route: {{ route.path }}</p> -->
        <h1>{{ $t('app_title') }}</h1>
        <div class="flex gap-2">
            <button type="button">aa</button>
            <button>aa</button>
            <button>aa</button>
            <button>aa</button>
        </div>
        <!-- <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a> -->
    </div>
</template>
