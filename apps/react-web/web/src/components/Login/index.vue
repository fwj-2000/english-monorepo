<template>
  <div v-if="isShowLogin" class="fixed inset-0 bg-black/40 z-overlay"></div>
  <Transition name="fade">
    <div v-if="isShowLogin" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="w-[440px] bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- 登录/注册切换 -->
        <div class="flex border-b border-border">
          <button
            @click="loginType = 'login'"
            :class="loginType === 'login' ? 'flex-1 py-4 text-center text-sm font-semibold text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'flex-1 py-4 text-center text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200'"
          >
            登录
          </button>
          <button
            @click="loginType = 'register'"
            :class="loginType === 'register' ? 'flex-1 py-4 text-center text-sm font-semibold text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'flex-1 py-4 text-center text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200'"
          >
            注册
          </button>
        </div>

        <!-- 表单区域 -->
        <div class="flex flex-col justify-center px-10 py-10">
          <LoginForm v-if="loginType === 'login'" />
          <RegisterForm v-if="loginType === 'register'" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  // import ModelViewer from './ModelViewer.vue'
  import LoginForm from './LoginForm.vue'
  import RegisterForm from './RegisterForm.vue'
  import { ref, inject } from 'vue'
  import { IS_SHOW_LOGIN } from './type'
  import type { LoginType } from './type'
  const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
  const loginType = ref<LoginType>('login')
  //1. pinia
  //2. event bus
  //3. provide/inject
  const changeType = (url: LoginType) => {
    loginType.value = url
  }
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      isShowLogin.value = false
    }
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
