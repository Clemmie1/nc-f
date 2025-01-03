<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useEmitter } from '@nguyenshort/vue3-mitt'
import {useRoute, useRouter} from "vue-router";
import {toast} from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import axios from "axios";

const emitter = useEmitter();
const route = useRoute();
const router = useRouter();

const error_message = ref({
  show: false,
  message: ''
});

const email = ref('');
const password = ref('');

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await axios.post(`${import.meta.env.APP_API_URL}/auth/register`, {
      email: email.value,
      password: password.value
    });
    if (response.data.success) {
      await router.push({name: 'Login'});
      emitter.emit('returnLogin', email.value);
    } else {
      error_message.value.show = true;
      error_message.value.message = response.data.message;
    }
  } catch (error) {
    error_message.value.show = true;
    error_message.value.message = 'Невозможно зарегистрировать пользователя в данный момент.';
  } finally {
    loading.value = false;
    setTimeout(() => {
      error_message.value.show = false;
    }, 2000);
  }

}


const toLoginForm = async () => {
  await router.push({name: 'Login'});

  if (email.value) {
    emitter.emit('returnLogin', email.value);
  }
}


</script>

<template>
  <main class="bg-[#212121] flex h-full items-center py-16 min-h-screen">
    <section class="w-full max-w-md mx-auto p-6">
      <div>
        <div class="w-full bg-neutral-900 rounded-lg shadow border border-neutral-700 md:mt-0 sm:max-w-md xl:p-0">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div class="text-center">
              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">{{ $t('sign_up') }}</h1>
              <p class="mt-2 text-sm text-neutral-400">
                {{ $t('already_have_an_account') }}
                <router-link :to="{name: 'Login'}">
                  <a class="decoration-2 hover:underline focus:outline-none focus:underline font-medium text-blue-500" href="/ui/login" @click="toLoginForm">
                    {{ $t('login_here') }}
                  </a>
                </router-link>
              </p>
            </div>

            <form class="space-y-4 md:space-y-6" @submit.prevent="handleLogin">
              <div>
                <label for="email" class="block mb-2 text-sm font-medium text-white">{{ $t('email') }}</label>
                <InputText :dt="{background: '#212121', 'focus.border.color': 'rgb(64 64 64)'}" v-model="email" :invalid="!email" placeholder="name@company.com" class="w-full" type="email" />
              </div>
              <div class="mb-2">
                <label for="password" class="block mb-2 text-sm font-medium text-white">{{ $t('password') }}</label>
                <Password class="w-full" :inputStyle="{background: '#212121'}" inputClass="w-full" :feedback="false" v-model="password" :invalid="!password" placeholder="••••••••" :toggleMask="true" />
              </div>

              <div>
                <div v-if="!error_message.show">
                  <Button type="submit" severity="secondary" :label="loading ? '' : $t('button_sign_up')" :loading="loading" class="w-full" :disabled="!email || !password || loading" :style="{ cursor: (!email || !password) ? 'not-allowed' : 'pointer' }"/>
                </div>
                <div v-else>
                  <Message style="height: 42px; cursor: not-allowed;" v-if="error_message.show" icon="pi pi-times-circle" severity="error" :life="2000">{{error_message.message}}</Message>
                </div>
              </div>

            </form>
          </div>
        </div>
        <p class="mt-3 flex justify-center items-center text-center divide-x divide-gray-300 dark:divide-neutral-700">
          <a class="pe-3.5 inline-flex items-center gap-x-2 text-sm text-gray-600 decoration-2 hover:underline hover:text-blue-600 dark:text-neutral-500 dark:hover:text-neutral-200" href="../../examples.html">

          </a>
        </p>
      </div>
    </section>
  </main>

</template>

<style scoped>

</style>