<script setup>
import { ref, onMounted } from "vue";
import Cookies from "js-cookie";
import DrawerBar from "./Pages/components/DrawerBar.vue";

// Переменная для отслеживания авторизованности пользователя
const isAuthenticated = ref(false);

// Проверка на авторизацию при монтировании компонента
onMounted(() => {
  const token = Cookies.get("token"); // Получаем токен из cookies
  isAuthenticated.value = !!token;   // Если токен существует, пользователь авторизован
});
</script>

<template>
  <!-- Условный рендер компонента DrawerBar для авторизованных пользователей -->
  <DrawerBar v-if="isAuthenticated" />
  <RouterView />
</template>

<style scoped>
</style>
