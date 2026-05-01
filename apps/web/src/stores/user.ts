import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser, Token } from '@en/common/user'
export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null) //用户信息
  const setUser = (params: WebResultUser) => {
    user.value = params //设置用户信息
  }
  const getUser = computed(() => user.value) //获取用户信息
  const logout = () => {
    user.value = null //退出登录
  }

  const getAccessToken = computed(() => {
    return user.value?.token.accessToken || null
  })
  const getRefreshToken = computed(() => {
    return user.value?.token.refreshToken || null
  })
  //更新token
  const updateToken = (newToken: Token) => {
    user.value!.token = newToken
  }
  return { user, setUser, getUser, logout, getAccessToken, getRefreshToken, updateToken }
}, { persist: true }) //持久化存储localStorage
