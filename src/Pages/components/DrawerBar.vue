<script setup>
import Drawer from 'primevue/drawer';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import InputText from 'primevue/inputtext';
import {computed, onMounted, onUnmounted, ref, shallowRef} from "vue";
import {useEmitter} from "@nguyenshort/vue3-mitt";
import {PanelLeftClose, MessageSquarePlus, Search, Image, Ellipsis} from "lucide-vue-next";
import Cookies from 'js-cookie';
import { useRoute, useRouter } from 'vue-router';
import api from "../../http/axiosConfig.js";
import { useConfirm } from "primevue/useconfirm";
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const visible = ref(false);
const visibleDeleteChat = ref(false);
const emitter = useEmitter();


import Menu from 'primevue/menu';
import Button from 'primevue/button';

const { t } = useI18n();

const chatList = ref([]);
const searchChat = ref('');
const renameChat = ref('');

// Вычисляемый список для фильтрации чатов
const filteredChatList = computed(() => {
  const search = searchChat.value.trim().toLowerCase();
  if (!search) return chatList.value;
  return chatList.value.filter(chat => chat.chatTitle.toLowerCase().includes(search));
});


const menu = ref([]);
const items = ref([
  {
    label: t('drawer_menu_option.rename_chat'),
    icon: 'pi pi-pencil',
  },
  {
    label: t('drawer_menu_option.delete_chat'),
    icon: 'pi pi-trash',
  }
]);

const loadChatHistory = async () => {
  try {
    const response = await api.get(`${import.meta.env.APP_API_URL}/storage/chats`);
    if (response.status === 200) {
      chatList.value = response.data.chats;
    }
  } catch (error) {
    // console.error("Error fetching chats:", error);
  }
}


const toggle = (index, chatId, chatTitle, event) => {
  if (menu.value[index]) {
    menu.value[index].toggle(event);  // Открытие меню
    items.value[0].command = () => {
      confirmRenameChat(index, chatId, chatTitle)
    };
    items.value[1].command = () => {
      confirmDeleteChat(index, chatId, chatTitle)
    };
  }
};

const confirmDeleteChat = (index, chatId, chatTitle) => {
  confirm.require({
    group: 'deleteChat',
    header: t('ConfirmDialog.delete_chat.header'),
    message: t('ConfirmDialog.delete_chat.message', {chatTitle}),
    accept: async () => {
      try {
        const response = await api.delete(`${import.meta.env.APP_API_URL}/storage/deleteChat`, {
          data: {
            chatId: chatId
          }
        });

        if (response.status === 200) {
          chatList.value.splice(index, 1);

          if (route.params.chatId === chatId) {
            await router.push({name: 'NewChat'})
          }
        }
      } catch (error) {

      }
    },
    reject: () => {

    }
  });
};

const confirmRenameChat = (index, chatId, chatTitle) => {
  renameChat.value = chatTitle;
  confirm.require({
    group: 'renameChat',
    header: t('ConfirmDialog.rename_chat.header'),
    accept: async () => {

      if (renameChat.value !== chatTitle){
        try {
          const response = await api.put(`${import.meta.env.APP_API_URL}/chat/rename`, {
            chatId: chatId,
            newName: renameChat.value
          });

          if (response.status === 200) {
            chatList.value[index].chatTitle = renameChat.value;
          }
        } catch (error) {

        } finally {
          renameChat.value = '';
        }
      }

    },
    reject: () => {

    }
  });
};

onMounted(() => emitter.on('xperikss', (data) => {
  visible.value = data
}));

onMounted(() => emitter.on('addChatHistory', (data) => {
  chatList.value.unshift({
    chatId: data.bar.chatId,
    chatTitle: data.bar.chatTitle
  });
}));

onMounted(() => {
  loadChatHistory()
})

async function goChat(id) {
  visible.value = false;
  return await router.push({name: 'Chat', params: {chatId: id}});
}

const logout =  () => {
  return window.location.replace("/auth/logout");
}

const onDrawerHide = () => {
  searchChat.value = '';
};


// Don't forget the destroy event. Avoid memory leaks
onUnmounted(() => emitter.off('xperikss'));
onUnmounted(() => emitter.off('addChatHistory'));

</script>

<template>

  <ConfirmDialog group="deleteChat">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center p-8 bg-surface-900 rounded">
        <span class="font-bold text-2xl block mb-2 mt-6">{{ message.header }}</span>
        <p class="mb-0">{{ message.message }}</p>
        <div class="flex items-center gap-2 mt-6">
          <Button size="small" :label="$t('ConfirmDialog.delete_chat.button_cancel')" severity="secondary" outlined @click="rejectCallback"></Button>
          <Button size="small" :label="$t('ConfirmDialog.delete_chat.button_delete')" severity="danger" raised @click="acceptCallback"></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>

  <ConfirmDialog group="renameChat">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center p-8 bg-surface-900 rounded">
        <span class="font-bold text-2xl block">{{ message.header }}</span>
        <div class="mt-6 mb-6">
          <InputText v-model="renameChat" :aria-placeholder="$t('ConfirmDialog.rename_chat.input_placeholder')"  type="text" :placeholder="$t('ConfirmDialog.rename_chat.input_placeholder')" :dt="{background: '#212121', 'focus.border.color': 'rgb(64 64 64)'}"/>
        </div>
        <div class="flex items-center gap-2">
          <Button size="small" :label="$t('ConfirmDialog.rename_chat.button_cancel')" severity="secondary" outlined @click="rejectCallback"></Button>
          <Button size="small" :label="$t('ConfirmDialog.rename_chat.button_save')" severity="success" raised @click="acceptCallback"></Button>
        </div>
      </div>
    </template>
  </ConfirmDialog>

  <Drawer @hide="onDrawerHide" v-model:visible="visible" :dismissable="false" :showCloseIcon="false" :modal="false" :dt="{'background': '#171717', 'header.padding': '0px'}">

    <template #header>

    </template>

    <div class="flex justify-between h-[60px] items-center md:h-header-height overflow-hidden">
      <span class="flex">
        <button v-tooltip="{ value: $t('tooltip.close_sidebar'), dt: {'background': '#0d0d0d','color': '#c5d0de','max.width': 'auto'}}"  @click="visible = false" class="h-10 rounded-lg px-2 text-[#b4b4b4] focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-[#212121] hover:bg-[#212121] no-draggable">
          <div class="relative will-change-transform">
            <PanelLeftClose
                color="#b4b4b4"
                size="23px"
            />
          </div>
        </button>
      </span>
      <div class="flex">
        <span class="flex">
          <button @click="router.push({name: 'NewChat'}).then(() => visible = false)" v-tooltip.bottom="{ value: $t('tooltip.new_chat'), dt: {'background': '#0d0d0d','color': '#c5d0de','max.width': 'auto'}}" class="h-10 rounded-lg px-2 text-[#b4b4b4] focus-visible:outline-0 disabled:text-token-text-quaternary focus-visible:bg-[#212121] hover:bg-[#212121] no-draggable">
            <div class="relative will-change-transform">
              <MessageSquarePlus
                  color="#b4b4b4"
                  size="23px"
              />
            </div>
          </button>
        </span>
      </div>
    </div>

    <div class="">
      <InputText  v-model="searchChat" type="text" size="small" :placeholder="$t('drawer_menu_option.input_search_chat_placeholder')" class="w-full" :dt="{background: '#212121', 'focus.border.color': 'rgb(64 64 64)'}"/>
    </div>

    <div class="border-t border-0 border-[#212121] mt-3 mb-3"></div>

    <div>
      <ul class="space-y-2">
        <li v-for="(list, index) in filteredChatList" :key="index">
          <div
              class="article-container flex items-center p-2 text-base font-medium rounded-lg text-white bg-[#212121] hover:bg-zinc-800 group"
          >
          <span
              class="flex-1 whitespace-nowrap cursor-pointer"
              @click="goChat(list.chatId)"
          >
            {{ list.chatTitle }}
          </span>
            <span
                class="hidden-block cursor-pointer inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100 dark:bg-primary-200 dark:text-primary-800"
            >
            <Menu ref="menu" :model="items" :popup="true" />
            <Ellipsis
                @click="toggle(index, list.chatId, list.chatTitle, $event)"
            />
          </span>
          </div>
        </li>
      </ul>
      <div v-if="!filteredChatList.length" class="text-center mt-[100px] text-gray-400">
        {{t('drawer_menu_option.chats_not_found')}}
      </div>
    </div>

    <template #footer class="bg-[#171717]">
      <Button label="ВЫЙТИ" icon="pi pi-power-off" size="large" severity="secondary" class="w-full" @click="logout" />
<!--      <button id="dropdownUserNameButton" data-dropdown-toggle="dropdownUserName" class="flex justify-between items-center p-2  w-full rounded-lg dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-50 dark:hover-bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700" type="button">-->
<!--        <span class="sr-only">Open user menu</span>-->
<!--        <div class="flex items-center">-->
<!--          <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png" class="mr-3 w-8 h-8 rounded-full" alt="Bonnie avatar" />-->
<!--          <div class="text-left">-->
<!--            <div class="font-semibold leading-none text-gray-900 dark:text-white mb-0.5">name@flowbite.com</div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>-->
<!--      </button>-->
    </template>
  </Drawer>
</template>

<style scoped>
.hidden-block {
  display: none;
}

.article-container:hover .hidden-block {
  display: flex; /* Или другой подходящий стиль, чтобы блок стал видимым */
}

/* Для мобильных устройств блоки всегда видимы */
@media (max-width: 768px) {
  .hidden-block, .article-container {
    display: flex !important; /* Используем !important, чтобы переопределить другие стили */
  }
}
</style>