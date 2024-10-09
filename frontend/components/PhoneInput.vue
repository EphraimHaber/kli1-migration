<script setup lang="ts">
import { VPhoneInput } from 'v-phone-input';
import { ref } from 'vue';

const phone = ref('');
</script>

<template>
    <div>
        <v-phone-input v-model="phone" country-icon-mode="svg" />
    </div>
</template>

<style scoped></style>
