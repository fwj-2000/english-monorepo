<template>
  <header
    class="flex items-center h-16 border-b border-border justify-center sticky top-0 bg-white/95 backdrop-blur z-header"
  >
    <div class="page-container flex items-center justify-between h-full">
      <!-- Logo -->
      <div class="flex items-center gap-3 h-full">
        <img class="h-full rounded-lg" src="../../assets/images/enlogo.png" />
        <span class="text-lg font-semibold text-text-primary">English Ease</span>
      </div>

      <!-- 导航 -->
      <nav class="flex items-center gap-1">
        <template v-for="route in routes" :key="route.path">
          <button
            @click="gotoPath(route.path)"
            :class="[
              'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors duration-150',
              isActive(route.path),
            ]"
          >
            <el-icon :size="18">
              <component :is="route.icon" />
            </el-icon>
            <span>{{ route.name }}</span>
          </button>
        </template>
      </nav>

      <!-- 右侧：统计 + 用户 -->
      <div class="flex items-center gap-3">
        <!-- 单词数 -->
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
        >
          <el-icon :size="16"><Sunny /></el-icon>
          <span>{{ userStore.getUser?.wordNumber ?? 0 }}</span>
        </div>
        <!-- 打卡天数 -->
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-500 rounded-full text-sm font-medium"
        >
          <el-icon :size="16"><Star /></el-icon>
          <span>{{ userStore.getUser?.dayNumber ?? 0 }}</span>
        </div>

        <!-- 用户头像 + 弹窗 -->
        <el-popover :width="340" trigger="click">
          <template #reference>
            <div class="flex items-center gap-2 pl-3 border-l border-border cursor-pointer">
              <img class="w-9 h-9 rounded-full" :src="avatar" />
              <span class="text-sm font-medium text-text-secondary">{{
                userStore.getUser?.name ?? '游客'
              }}</span>
            </div>
          </template>
          <Profile />
        </el-popover>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import {
    Sunny,
    Star,
    HomeFilled,
    Notebook,
    MagicStick,
    Reading,
    Setting,
  } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import { watch, ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  import Profile from '../Profile/index.vue'
  import { useAvatar } from '@/hooks/useAvatar'
  import { useLogin } from '@/hooks/useLogin'
  const { avatar } = useAvatar()
  const { login } = useLogin()
  const userStore = useUserStore()
  const router = useRouter()
  const currentPath = ref('')
  const routes = [
    { path: '/', name: '主页', icon: HomeFilled, isAuth: false }, //不需要登录
    { path: '/chat/index', name: 'AI', icon: MagicStick, isAuth: true }, //需要登录
    { path: '/word-book/index', name: '词库', icon: Notebook, isAuth: false }, //不需要登录
    { path: '/courses/index', name: '课程', icon: Reading, isAuth: false }, //不需要登录
    { path: '/setting/index', name: '设置', icon: Setting, isAuth: true }, //需要登录
  ]
  const isActive = (path: string) => {
    return currentPath.value === path
      ? 'bg-primary-50 text-primary-700 font-semibold'
      : 'text-text-secondary hover:bg-primary-50 hover:text-primary-700'
  }
  watch(
    () => router.currentRoute.value,
    newVal => {
      currentPath.value = newVal.path
    },
    {
      immediate: true,
    }
  )
  const gotoPath = async (path: string) => {
    const isAuth = routes.find(route => route.path === path)?.isAuth ?? false
    //如果是true表示必须登录
    if (isAuth) {
      await login()
      //如果登录了下面的代码才会走
      if (userStore.getUser) {
        router.push(path)
      }
    } else {
      router.push(path)
    }
  }
</script>
