<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import ProgressSpinner from 'primevue/progressspinner';
import { v4 as uuidv4 } from 'uuid';
import router from "../../../../router/index.js";
import Cookies from 'js-cookie';
import {useEmitter} from "@nguyenshort/vue3-mitt";
import Message from 'primevue/message';
import api from "../../../../http/axiosConfig.js";
const token = Cookies.get('auth');
const uuid = ref("");
const message = ref(''); // Текст в textarea
const textareaRef = ref(null); // Ссылка на textarea
const loading = ref(false);
let visible = ref(false);
const emitter = useEmitter();

// Функция для автоматической подгонки высоты
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = '1px'; // Сбрасываем высоту
    textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем на основе содержимого
  }
};

async function createChat() {

  loading.value = true;
  visible.value = false;

  try {
    const response = await api.post(`${import.meta.env.APP_API_URL}/storage/createChat`, {
      chatId: uuid.value,
      input: message.value
    });

    if (response.status === 200) {
      emitter.emit('addChatHistory', {
        bar: {
          chatId: uuid.value,
          chatTitle: "Новый чат",
        },
        history: {
          role: "USER",
          message: message.value
        }
      });
      await router.push({
        name: 'Chat', params: {
          chatId: uuid.value
        }
      });
      emitter.emit('addChatContents', {
        firstMessage: true,
        data: {
          role: "USER",
          message: message.value
        }
      });
    }

  } catch (e) {

  } finally {
    loading.value = false;
  }

  // await router.push({name: 'Chat', params: {
  //   chatId: uuid.value
  // }});
}

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey || event.metaKey) {
      // CTRL + Enter или CMD + Enter
      event.preventDefault();
      if (!loading.value && message.value.trim()) {
        createChat();
      }
    } else if (event.shiftKey) {
      // SHIFT + Enter
      adjustTextareaHeight();
    } else {
      // Просто Enter
      event.preventDefault();
      if (!loading.value && message.value.trim()) {
        createChat();
      }
    }
  }
};

function generateUuid() {
  uuid.value = uuidv4();
}

onMounted(() => {
  generateUuid();
  adjustTextareaHeight();
});

</script>

<template>

  <div class="w-full">
    <div class="relative flex h-full max-w-full flex-1 flex-col">

      <div class="group relative flex w-full items-center">
        <div class="flex w-full flex-col gap-1.5 rounded-[26px] px-2.5 py-1.5 bg-[#303030]">
          <div class="flex items-end gap-1.5 pl-4">
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="text-token-text-primary max-h-52 overflow-auto">
                <textarea
                    :disabled="loading"
                    v-model="message"
                    @keydown="handleKeyDown"
                    ref="textareaRef"
                    @input="adjustTextareaHeight"
                    :placeholder="$t('Chat.textarea_placeholder')"
                    class="block w-full resize-none border-0 bg-transparent px-0 py-2 text-token-text-primary placeholder:text-token-text-secondary"
                ></textarea>
              </div>
            </div>
            <div class="mb-1 me-1">
              <div class="min-w-8">
                <button
                    v-if="!loading"
                    aria-label="Отправить подсказку"
                    @click="createChat"
                    @keydown="handleKeyDown"
                    :disabled="loading || !message.trim()"
                    title="Отправить подсказку"
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white disabled:bg-[#676767]">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path></svg>
                </button>
                <button
                    v-else
                    aria-label="Отправить подсказку"
                    @click="createChat"
                    disabled
                    title="Отправить подсказку"
                    class="flex h-8 w-8 items-center justify-center ">
                  <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="6" fill="transparent"
                                   animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-3">
    <Message v-if="visible" severity="error" :life="3000">
      Недостаточно памяти для нового чата.
    </Message>
  </div>
</template>

<style scoped>

</style>