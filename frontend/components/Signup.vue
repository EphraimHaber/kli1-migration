<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import { VPhoneInput } from 'v-phone-input';

const formRef = ref(null);
const inputRef = ref<any>(null);
const valid = ref(false);
const name = ref('');
const phone = ref('');
const email = ref('');
const password = ref('');
const role = ref('');

const roles = ref(['freelancer', 'customer']);

const ignoreErrors: any = null;

const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
];

const nameRules = [(v: string) => !!v || 'Name is required'];
const phoneRules = [(v: string) => !!v || 'Phone number is required'];

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 6 characters',
];

const signup = async () => {
    emit('close');
    const roleValue = role.value;
    if (roleValue !== 'customer' && roleValue !== 'freelancer' && roleValue !== 'none') return;

    const data: SignupRequest = {
        registerEmail: email.value,
        registerPassword: password.value,
        confirmPassword: password.value,
        role: roleValue,
    };

    const signupResponse = await useConnectService().signup(data);
    if (signupResponse.status !== 201) {
        toast.error('Sign Up Failed', { position: 'top-center', autoClose: 700, hideProgressBar: true });
        return;
    }
    const loginResponse = await useConnectService().login(email.value, password.value);
    if (loginResponse.status !== 200) {
        toast.error('Auto Login Failed', { position: 'top-center', autoClose: 700, hideProgressBar: true });
        return;
    }
    toast.success('Sign Up And Login Successful', { position: 'top-center', autoClose: 700, hideProgressBar: true });
    localStorage.setItem('token', loginResponse.data.data.token);
    emit('close');
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
            <v-btn icon class="close-btn" elevation="0" @click="emit('close')">
                <v-icon :color="'#d23d20'">mdi-close</v-icon>
            </v-btn>
        </div>
        <div class="dialog-header mb-2">{{ $t('header.signUp') }}</div>

        <v-form class="pl-4 pr-4" ref="formRef" v-model="valid" lazy-validation>
            <v-container>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field
                            class="mb-2"
                            :variant="'outlined'"
                            v-model="name"
                            label="Name"
                            :rules="nameRules"
                            required
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field
                            class="mb-2"
                            :variant="'outlined'"
                            v-model="email"
                            :rules="emailRules"
                            label="email"
                            required
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-phone-input
                            ref="inputRef"
                            :phone-props="{ variant: 'outlined' }"
                            :country-label="''"
                            :country-props="{ variant: 'outlined' }"
                            v-model="phone"
                            :invalid-message="ignoreErrors"
                            :rules="phoneRules"
                            country-icon-mode="svg"
                        />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field
                            class="mb-2"
                            :variant="'outlined'"
                            label="Password"
                            v-model="password"
                            :rules="passwordRules"
                            type="password"
                            required
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-select
                    :variant="'outlined'"
                    v-model="role"
                    :items="roles"
                    :rules="[(v) => !!v || 'Role is required']"
                    label="Role"
                    required
                ></v-select>
            </v-container>
            <v-btn style="padding: 10px" block :color="'#d23d20'" :disabled="!valid" @click="signup()">{{
                $t('header.signUp')
            }}</v-btn>
        </v-form>
        <v-card-text class="text-center"> Sing in with your social network</v-card-text>

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
