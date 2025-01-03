<script setup>
import { PanelLeftOpen, MessageSquarePlus, CircleUserRound } from 'lucide-vue-next';
import router from "../../router/index.js";
import Select from 'primevue/select';
import { useEmitter } from '@nguyenshort/vue3-mitt'
import {ref} from "vue";

const emitter = useEmitter();

const selectedCity = ref();
const cities = ref([
  { name: 'cohere.command-r-08-2024', code: 'cohere' },
  { name: 'cohere.command-r-16k', code: 'cohere' },
  { name: 'cohere.command-r-plus', code: 'cohere' },
  { name: 'meta.llama-3.1-405b', code: 'meta' },
  { name: 'meta.llama-3.1-70b', code: 'meta' },
]);

const clickTo = () => {
  emitter.emit('xperikss', true);
}
</script>
<template>
  <div class="draggable sticky top-0 z-10 flex min-h-[60px] items-center justify-center border-transparent bg-token-main-surface-primary pl-0">
    <div class="no-draggable absolute bottom-0 left-0 top-0 ml-3 inline-flex items-center justify-center">
      <button type="button" v-tooltip="{ value: $t('tooltip.open_sidebar'), dt: {'background': '#0d0d0d','color': '#c5d0de','max.width': 'auto'}}" @click="clickTo" class="inline-flex rounded-md hover:text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white active:opacity-50" data-testid="open-sidebar-button">
        <PanelLeftOpen
            color="#b4b4b4"
        />
      </button>
      <button v-tooltip.bottom="{ value: $t('tooltip.new_chat'), dt: {'background': '#0d0d0d','color': '#c5d0de','max.width': 'auto'}}" @click="router.push({name: 'NewChat'})" class="h-10 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-token-sidebar-surface-secondary enabled:hover:bg-token-sidebar-surface-secondary">
        <MessageSquarePlus
            color="#b4b4b4"
        />
      </button>

    </div>
    <div class="">
      <Select
          v-model="selectedCity"
          :options="cities"
          optionLabel="name"
          placeholder="Select a City"
          checkmark
          :highlightOnSelect="false"
          class="w-52 md:w-52"
          :dt='
            {
              "option.focus.color": "red",
              "option.selected.focus.color": "red",
            }
          '
      />
    </div>
    <div class="no-draggable absolute bottom-0 right-0 top-0 mr-3 inline-flex items-center justify-center">
          <span class="flex" data-state="closed">
             <button class="h-10 rounded-lg px-2 text-token-text-secondary focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-token-sidebar-surface-secondary enabled:hover:bg-token-sidebar-surface-secondary">
                <CircleUserRound
                    color="#b4b4b4"
                />
             </button>
          </span>
    </div>
  </div>

  <div></div>
</template>

<style scoped>

</style>