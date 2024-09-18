<script setup lang="ts">
import SiteHeader from '~/components/SiteHeader.vue';
</script>

<template>
    <div>
        <SiteHeader />
        Layout: default
        <slot />
    </div>
</template>

<style scoped></style>

<!-- <script lang="ts">
console.log(process.env.NODE_ENV);
</script> -->
