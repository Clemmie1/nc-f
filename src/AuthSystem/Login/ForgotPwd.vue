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
import { MailCheck } from 'lucide-vue-next';

const emitter = useEmitter();
const route = useRoute();
const router = useRouter();

const error_message = ref({
  show: false,
  severity: '',
  message: ''
});

const email = ref('');
const loading = ref(false);
const formForgotPwd = ref(true);



const handleForgotPwd = async () => {
  loading.value = true;

  try {
    const response = await axios.post(`${import.meta.env.APP_API_URL}/auth/forgot-password`, {
      email: email.value
    });
    if (response.data.success) {
      formForgotPwd.value = false;
    }
  } catch (error) {
    if (error.status === 400 || 404 || 500) {
      error_message.value.show = true;
      error_message.value.severity = 'error';
      error_message.value.message = error.response.data.message;
    }
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
            <div>

              <div v-if="formForgotPwd">

                <div class="text-center">
                  <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">{{ $t('forgotpwd') }}</h1>
                </div>

                <form class="space-y-4 md:space-y-6" @submit.prevent="handleForgotPwd">
                  <div>
                    <label for="email" class="block mb-2 text-sm font-medium text-white">{{ $t('email') }}</label>
                    <InputText :dt="{background: '#212121', 'focus.border.color': 'rgb(64 64 64)'}" v-model="email" :invalid="!email" placeholder="name@company.com" class="w-full" type="email" />
                  </div>

                  <div>
                    <div v-if="!error_message.show">
                      <Button type="submit" severity="secondary" :label="loading ? '' : $t('send_reset_email')" :loading="loading" class="w-full" :disabled="!email || loading" :style="{ cursor: (!email) ? 'not-allowed' : 'pointer' }"/>
                    </div>
                    <div v-else>
                      <Message style="height: 42px; cursor: not-allowed;" v-if="error_message.show"  :severity="error_message.severity" :life="2000">{{error_message.message}}</Message>
                    </div>
                  </div>

                </form>

              </div>
              <div v-else>
                <div class="mb-3">
                  <MailCheck
                    color="#4eaa24"
                    :size="42"
                  />
                </div>
                <div class="mt-6 mb-6">
                  <p class="text-[15px] mb-3 font-bold">{{$t('password_reset_notification_sent')}}.</p>
                  <p class="text-sm">
                    <div v-html="$t('forgotpwd_1', {email})"></div>
                    <br>
                    <br>
                    {{$t('forgotpwd_2')}}
                  </p>
                </div>
                <router-link :to="{name: 'Login'}">
                  <Button type="button" severity="secondary" :label="$t('retur_to_login_page')"  class="w-full" :style="{ cursor: 'pointer' }"/>
                </router-link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

</template>

<style scoped>

</style>