<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white">
      <!--      <span v-for="(letter, index) in displayedText" :key="index">{{ letter }}</span>-->
      {{ $t('newChat.help') }}
    </h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const phrases = [
  'Чем я могу помочь?',
  'Как я могу вам помочь?',
  'Что вас интересует?',
  'Чем могу быть полезен?',
  'Что вы хотите узнать?',
  'Какую информацию вам нужно?'
];

// Случайно выбираем фразу
const fullText = phrases[Math.floor(Math.random() * phrases.length)];
const displayedText = ref('');
const isLoading = ref(true); // Для отслеживания состояния загрузки

onMounted(() => {
  // Показываем "Загрузка..." 0.5 секунды, потом заменяем на текст
  setTimeout(() => {
    isLoading.value = false;
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        displayedText.value += fullText[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Время между буквами в миллисекундах
  }, 500); // Задержка 0.5 сек для "Загрузка..."
});
</script>

<style scoped>
/* Основной контейнер */
h1 {
  display: inline-block;
}

/* Анимация букв с эффектом появления */
h1 .letter-animation {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s ease-out forwards;
}

h1 .letter-animation:nth-child(even) {
  animation-delay: 0.1s;
}

h1 .letter-animation:nth-child(odd) {
  animation-delay: 0.2s;
}

/* Анимация для каждой буквы */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
