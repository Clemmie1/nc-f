<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import {useEmitter} from '@nguyenshort/vue3-mitt'
import Dialog from 'primevue/dialog';
import InputOtp from 'primevue/inputotp';
import Cookies from 'js-cookie';

import {toast} from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import axios from "axios";
import router from "../../router/index.js";


const emitter = useEmitter()

const error_message = ref({
  show: false,
  message: ''
});

const error_tw_message = ref({
  show: false,
  severity: '',
  message: ''
});


const email = ref('');
const password = ref('');
const pinCode = ref('');
const twoFactorModal = ref(false);

const loading = ref(false);
const loadingVerifyPin = ref(false);
const resendDisabled = ref(false); // Состояние кнопки (заблокирована или нет)
const timer = ref(0); // Таймер обратного отсчёта

const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await axios.post(`${import.meta.env.APP_API_URL}/auth/login`, {
      email: email.value,
      password: password.value
    });

    if (response.data.success){
      if (response.data.type === "2FA"){
        Cookies.set('tokenTwoFactor', "FALSE", { expires: 2 });
        startTimer(120);
        twoFactorModal.value = true;
      } else if (response.data.type === "Login") {
         await redirectToConsole(response.data.token.accessToken, response.data.token.refreshToken)
      }
    }

  } catch (error) {
    if (error.status === 401) {
      error_message.value.show = true;
      error_message.value.message = error.response.data.message || 'Неверный email или пароль';
    } else if (error.status === 500){
      error_message.value.show = true;
      error_message.value.message = 'Невозможно войти в систему в данный момент';
    }
  } finally {
    loading.value = false;
    setTimeout(() => {
      error_message.value.show = false;
    }, 2000);
  }

}

const verifyPin = async () => {
  loadingVerifyPin.value = true;

  try {
    const response = await axios.post(`${import.meta.env.APP_API_URL}/auth/verify-2fa`, {
      pinCode: pinCode.value,
      token: Cookies.get("tokenTwoFactor"), // Токен, сохранённый после отправки PIN-кода
    });
    if (response.data.success) {
      await redirectToConsole(response.data.token.accessToken)
    }
  } catch (error) {
    if (error.status === 400 || 401 || 404 || 500) {
      error_tw_message.value.show = true;
      error_tw_message.value.severity = 'error';
      error_tw_message.value.message = error.response.data.message;

      pinCode.value = '';
    }
  } finally {
    loadingVerifyPin.value = false;
    setTimeout(() => {
      error_tw_message.value.show = false;
    }, 2000);
  }
};

// Следим за изменением PIN-кода
watch(pinCode, (newValue) => {
  if (newValue.length === 6) {
    // Отправляем запрос только если длина PIN-кода равна 4
    verifyPin();
  }
});

const resendPin = async () => {
  if (resendDisabled.value) return; // Блокируем повторный клик

  loading.value = true;
  try {
    const response = await axios.post(`${import.meta.env.APP_API_URL}/auth/resend-2fa`, {
      token: Cookies.get("tokenTwoFactor"), // Используем текущий токен
    });

    if (response.data.success) {
      error_tw_message.value.show = true;
      error_tw_message.value.severity = 'success';
      error_tw_message.value.message = response.data.message;
      startTimer(120); // Устанавливаем таймер на 2 минуты
    } else {
      console.error("Ошибка при отправке PIN-кода:", response.data.message);
    }
  } catch (error) {
    if (error.status === 400 || 500) {
      error_tw_message.value.show = true;
      error_tw_message.value.severity = 'error';
      error_tw_message.value.message = error.response.data.message;
    }
  } finally {
    loading.value = false;
  }
};

const startTimer = (seconds) => {
  timer.value = seconds;
  resendDisabled.value = true;

  const interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(interval); // Останавливаем таймер
      resendDisabled.value = false;
    }
  }, 1000);
};

const redirectToConsole = async (authToken, refreshToken) => {
  // localStorage.setItem('token', authToken);
  // localStorage.setItem('refreshToken', refreshToken);
  Cookies.set('token', authToken);
  Cookies.set('refreshToken', refreshToken);
  twoFactorModal.value = false;

  window.location.replace("/");
  // await router.push({name: 'NewChat'});
}

onMounted(() => emitter.on('returnLogin', (data) => {
  email.value = data;
}));

// Don't forget the destroy event. Avoid memory leaks
onUnmounted(() => emitter.off('returnLogin'));
</script>

<template>

  <Dialog v-model:visible="twoFactorModal" modal header="2FA" :showHeader="false" :draggable="false" :closable="false" :style="{ width: '25rem' }">
    <div  class="text-surface-400 block mt-6 text-center mb-6">
      <p class="font-bold text-lg mb-3">{{ $t('login_2fa_title') }}</p>
      <p>
        <div v-html="$t('login_2fa_sent', {email})"></div>
      </p>
    </div>
    <div class="flex justify-center mb-6">
      <InputOtp v-model="pinCode" :length="6" integerOnly size="large" :disabled="loadingVerifyPin" :style="{borderColor: 'red'}" />
    </div>

    <div>
      <div v-if="error_tw_message.show">
        <Message :severity="error_tw_message.severity" class="mb-3">{{error_tw_message.message}}</Message>
      </div>
    </div>

    <div>
      <Button
          type="button"
          @click="resendPin"
          severity="secondary"
          :label="loading ? $t('2fa_sending') : resendDisabled ? `${$t('2fa_resend_via')} ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : $t('2fa_send_resend')"
          class="w-full"
          :disabled="resendDisabled || loading"
          :style="{ cursor: (resendDisabled || loading) ? 'not-allowed' : 'pointer' }"
      />
    </div>
  </Dialog>

  <main class="bg-[#212121] flex h-full items-center py-16 min-h-screen">
    <section class="w-full max-w-md mx-auto p-6">
      <div>
        <div class="w-full bg-neutral-900 rounded-lg shadow border border-neutral-700 md:mt-0 sm:max-w-md xl:p-0">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div class="text-center">
              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">{{ $t('sign_in') }}</h1>
              <p class="mt-2 text-sm text-neutral-400">
                {{ $t('dont_have_an_account_yet') }}
                <router-link :to="{name: 'Register'}">
                  <a class="decoration-2 hover:underline focus:outline-none focus:underline font-medium text-blue-500" href="/ui/register">
                    {{ $t('register_here') }}
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
                <Password class="w-full" :inputStyle="{background: '#212121'}"  inputClass="w-full text-sm" :feedback="false" v-model="password" :invalid="!password" placeholder="••••••••" :toggleMask="true" />
              </div>

              <div>
                <div v-if="!error_message.show">
                  <Button type="submit" severity="secondary" :label="loading ? '' : $t('button_sign_in')" :loading="loading" class="w-full" :disabled="!email || !password || loading" :style="{ cursor: (!email || !password) ? 'not-allowed' : 'pointer' }"/>
                </div>
                <div v-else>
                  <Message style="height: 42px; cursor: not-allowed;" v-if="error_message.show" icon="pi pi-times-circle" severity="error" :life="2000">{{error_message.message}}</Message>
                </div>
              </div>

            </form>
          </div>
        </div>
        <p class="mt-3 flex justify-center items-center text-center divide-x divide-gray-300 dark:divide-neutral-700">
          <router-link :to="{name: 'Forgotpwd'}">
            <a class="pe-3.5 inline-flex items-center gap-x-2 text-sm text-gray-600 decoration-2 hover:underline hover:text-blue-600 dark:text-neutral-500 dark:hover:text-neutral-200" href="/ui/forgotpwd">
              {{ $t('forgotpwd') }}
            </a>
          </router-link>
        </p>
      </div>
    </section>
  </main>

</template>

<style scoped>
::v-deep(.p-password .p-inputtext:enabled:focus) {
  border-color: rgb(64 64 64);
}
</style>