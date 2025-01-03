import { createApp } from 'vue'
import router from "./router/index.js";
import './style.css'
import 'primeicons/primeicons.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import VueMitter from '@nguyenshort/vue3-mitt'
import StyleClass from 'primevue/styleclass';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import { createI18n } from 'vue-i18n';
import ru from './lang/ru.json';
import en from './lang/en.json';

import ConfirmationService from 'primevue/confirmationservice';

const translations = { ru, en };

const i18n = createI18n({
    locale: 'en',
    messages: translations
});


createApp(App)
    .use(VueMitter)
    .use(router)
    .use(i18n)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: true,
            }
        }
    })
    .use(ToastService)
    .use(ConfirmationService)
    .directive('styleclass', StyleClass)
    .directive('tooltip', Tooltip)
    .mount('#app')
