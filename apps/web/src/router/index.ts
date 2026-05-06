import { createRouter, createWebHistory } from 'vue-router'
import home from './home/index'
import wordBook from './word-book/index'
import setting from './setting/index'
import chat from './chat/index'
import { useUserStore } from '@/stores/user'
import { isShowLoginDialog } from '@/stores/loginDialog'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home,      // 主页 - 无需登录
    ...wordBook,  // 词库 - 无需登录
    ...setting,   // 设置 - 需登录
    ...chat       // AI 聊天 - 需登录
  ]
})

/** 需要登录才能访问的路由路径前缀 */
const authRequiredPaths = ['/setting', '/chat']

/**
 * 全局前置守卫 —— 未登录访问 setting / chat 时自动弹出登录弹窗
 */
router.beforeEach((to) => {
  const requiresAuth = authRequiredPaths.some(path => to.path.startsWith(path))

  if (requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.getUser) {
      // 打开登录弹窗，同时将页面重定向到首页
      isShowLoginDialog.value = true
      return '/'
    }
  }
})

export default router
