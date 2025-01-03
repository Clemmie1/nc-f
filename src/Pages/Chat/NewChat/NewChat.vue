<script setup>
import WelcomeToChat from "./components/WelcomeToChat.vue";
import InputForm from "./components/InputForm.vue";
import HeaderBar from "../../components/HeaderBar.vue";

</script>

<template>


  <div class="h-screen flex flex-col pb-6 bg-[#212121]">

    <HeaderBar />

    <div class="h-full flex flex-col justify-center">
      <div class="-mt-20 max-w-4xl w-full text-center mx-auto px-4 sm:px-6 lg:px-8">
        <WelcomeToChat />
      </div>

      <!-- Search -->
      <div class="mt-10 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative">
          <InputForm />
        </div>
      </div>
      <!-- End Search -->
    </div>

    <footer class="mt-auto max-w-4xl text-center mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-xs text-neutral-500">
        {{$t('nc_footer_text')}}
      </p>
    </footer>
  </div>
  <!-- End Content -->
</template>

<style scoped>
/* Tailwind and custom styles */
</style>
