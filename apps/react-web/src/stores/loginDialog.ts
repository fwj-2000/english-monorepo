// 全局登录弹窗可见性 —— 模块级变量 + 订阅模式
// 路由守卫等非组件代码可以 import 后直接修改，
// Login 组件通过 createLoginDialogStore 订阅变化

import { create } from 'zustand'

interface LoginDialogState {
  visible: boolean
  show: () => void
  hide: () => void
}

export const useLoginDialogStore = create<LoginDialogState>()((set) => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}))
