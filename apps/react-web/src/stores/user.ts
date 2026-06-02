import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WebResultUser, Token, UserUpdate } from '@en/common/user'

interface UserState {
  user: WebResultUser | null
  // 下面的 getter 作为普通函数，不在 React 里也能调用 getState().xxx
  setUser: (params: WebResultUser) => void
  logout: () => void
  updateToken: (newToken: Token) => void
  updateUser: (params: UserUpdate) => void
  updateUserWordNumber: (wordNumber: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (params) => set({ user: params }),
      logout: () => set({ user: null }),

      updateToken: (newToken) =>
        set((state) => {
          if (!state.user) return state
          return { user: { ...state.user, token: newToken } }
        }),

      updateUser: (params) =>
        set((state) => {
          if (!state.user) return state
          return {
            user: {
              ...state.user,
              name: params.name,
              email: params.email,
              address: params.address,
              avatar: params.avatar,
              bio: params.bio,
              isTimingTask: params.isTimingTask,
              timingTaskTime: params.timingTaskTime,
            },
          }
        }),

      updateUserWordNumber: (wordNumber) =>
        set((state) => {
          if (!state.user) return state
          return { user: { ...state.user, wordNumber } }
        }),
    }),
    { name: 'user-storage' }
  )
)

// ========= 辅助 getter（组件外也能用） =========
export const getAccessToken = (): string | null => useUserStore.getState().user?.token.accessToken ?? null
export const getRefreshToken = (): string | null => useUserStore.getState().user?.token.refreshToken ?? null
