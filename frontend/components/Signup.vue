<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue3-toastify';

const formRef = ref(null);
const valid = ref(false);
const email = ref('');
const password = ref('');

const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
];

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 6 characters',
];

const signup = async () => {
    // const loginResponse = await useConnectService().login(email.value, password.value);
    // if (loginResponse.status !== 200) {
    //     toast.error('Login Failed', { position: 'top-center', autoClose: 700, hideProgressBar: true });
    //     return;
    // }
    // toast.success('Login Successful', { position: 'top-center', autoClose: 700, hideProgressBar: true });
    // localStorage.setItem('token', loginResponse.data.data.token);
    // const t = await useConnectService().checkAuth();
    // console.log(t);
};

const handleClick = (provider: 'google' | 'facebook') => {
    console.log(`Image button clicked ${provider}`);
};

const emit = defineEmits<{
    (e: 'close'): void;
}>();
</script>

<template>
    <v-card>
        <div class="close-button-container">
            <!-- <v-btn icon class="close-btn" elevation="0" @click="isActive.value = false"> -->
            <v-btn icon class="close-btn" elevation="0" @click="emit('close')">
                <v-icon :color="'#d23d20'">mdi-close</v-icon>
            </v-btn>
        </div>
        <div class="dialog-header mb-2">{{ $t('header.signUp') }}</div>
        <PhoneInput />
        <!-- <v-form class="pl-14 pr-14" ref="formRef" v-model="valid" lazy-validation>
            <v-text-field label="Email" v-model="email" :rules="emailRules" required></v-text-field>

            <v-text-field
                label="Password"
                v-model="password"
                :rules="passwordRules"
                type="password"
                required
            ></v-text-field>
            <v-btn style="padding: 10px" block :color="'#d23d20'" :disabled="!valid" @click="submit">Log in</v-btn>
        </v-form> -->
        <v-card-text class="text-center"> Sing in with your social network </v-card-text>

        <div class="o-auth-icon-buttons items-center mb-3">
            <v-btn @click="() => handleClick('facebook')" elevation="0" class="image-button" icon>
                <v-img class="kli1-logo" :width="36" :height="36" src="@/assets/image/facebook.png"></v-img>
            </v-btn>
            <v-btn @click="() => handleClick('google')" elevation="0" class="image-button" icon>
                <v-img class="kli1-logo" :width="36" :height="36" src="@/assets/image/google.png"></v-img>
            </v-btn>
        </div>
    </v-card>
</template>

<style scoped>
.dialog-header {
    font-size: xx-large;
    text-align: center;
    font-weight: bold;
}

.image-button {
    padding: 0;
    min-width: 0;
}
.o-auth-icon-buttons {
    display: flex;
    justify-content: space-evenly;
}
</style>
