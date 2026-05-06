import { ref } from 'vue'

/**
 * 全局登录弹窗可见性状态
 *
 * 区别于 useLogin hook 中的 inject/provide 方案，
 * 这个 ref 定义在模块顶层，可以在组件外（如路由守卫）直接 import 并修改。
 * Login/index.vue 通过 provide/inject 获取的是同一个 ref 引用，
 * 因此路由守卫修改此值时，登录弹窗会同步响应。
 */
export const isShowLoginDialog = ref(false)
