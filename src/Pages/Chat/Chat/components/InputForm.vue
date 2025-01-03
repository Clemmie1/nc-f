<script setup>
import Cookies from "js-cookie";
import {nextTick, onMounted, ref, watch} from "vue";

const props = defineProps({
  content: String,
  sendRequest: Function,
  stopRequest: Function,
  adjustTextareaHeight: Function,
  creatingMessage: Boolean
});


const sendRequestHandler = () => {
  props.sendRequest(false);
  content.value = ''; // Сбрасываем текст
  nextTick(() => {
    adjustTextareaHeight(); // Обновляем высоту после сброса
  });
};

const stopRequestHandler = () => {
  props.stopRequest();
  content.value = '';
  nextTick(() => {
    adjustTextareaHeight();
  });
};


const emits = defineEmits([
  "update:content"
]);

const content = ref(props.content);

watch(content, (newValue) => {
  emits("update:content", newValue);
});

const textareaRef = ref(null); // Ссылка на textarea

const adjustTextareaHeight = () => {
  const textarea = textareaRef.value;
  if (textarea){
    textarea.style.height = '1px'; // Сбрасываем высоту
    textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем на основе содержимого
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (!props.creatingMessage && content.value.trim()) {
        sendRequestHandler();
      }
    } else if (event.shiftKey) {
      adjustTextareaHeight();
    } else {
      event.preventDefault();
      if (!props.creatingMessage && content.value.trim()) {
        sendRequestHandler();
      }
    }
  }
};
onMounted(() => {
  adjustTextareaHeight();
});

</script>

<template>
  <form class="w-full" @submit.prevent="sendRequestHandler">
    <div class="relative flex h-full max-w-full flex-1 flex-col">
      <div class="group relative flex w-full items-center">
        <div class="flex w-full flex-col gap-1.5 rounded-[26px] px-2.5 py-1.5 bg-[#303030]">
          <div class="flex items-end gap-1.5 pl-4">
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="text-token-text-primary max-h-52 overflow-auto">
                  <textarea
                      v-model="content"
                      ref="textareaRef"
                      @keydown="handleKeyDown"
                      :disabled="props.creatingMessage"
                      @input="adjustTextareaHeight"
                      :placeholder="$t('Chat.textarea_placeholder')"
                      class="block w-full resize-none border-0 bg-transparent px-0 py-2 text-token-text-primary placeholder:text-token-text-secondary"
                  ></textarea>
              </div>
            </div>
            <div class="mb-1 me-1">
              <div class="min-w-8">
                <div>
                  <div v-if="!props.creatingMessage">
                    <button
                        :disabled="!props.content.trim()"
                        aria-label="Отправить подсказку"
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white disabled:bg-[#676767]"
                        @click.prevent="sendRequestHandler"
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path></svg>
                    </button>
                  </div>
                  <div v-else>
                    <button
                        aria-label="Stop подсказку"
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white disabled:bg-[#676767]"
                        @click="stopRequestHandler"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><rect x="7" y="7" width="10" height="10" rx="1.25" fill="currentColor"></rect></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>

</style>