import axios from 'axios'
import { message } from 'antd'
import { useUserStore, getAccessToken, getRefreshToken } from '@/stores/user'
import { navigateTo } from '@/routers/navigate'
import { refreshTokenApi } from './auth'

export const uploadUrl = import.meta.env.VITE_MINIO_ENDPOINT
export const socketUrl = import.meta.env.VITE_SOCKET_URL

console.log('🚀 ~ uploadUrl:', uploadUrl)
export const timeout = 50000

export const serverApi = axios.create({
  baseURL: '/api/v1',
  timeout,
})

let isRefreshing = false
let requestQueue: ((newAccessToken: string) => void)[] = []

serverApi.interceptors.request.use(config => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

serverApi.interceptors.response.use(
  res => res.data,
  async error => {
    if (error.code === 'ERR_NETWORK') {
      message.error('网络连接失败,请重试')
      return Promise.reject(error)
    }
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error)
    }

    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    const originalRequest = error.config

    if (!accessToken || !refreshToken) {
      useUserStore.getState().logout()
      navigateTo('/')
      message.error('登录已过期,请重新登录')
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise(resolve => {
        requestQueue.push((newAccessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          resolve(serverApi(originalRequest))
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken! })
      if (newToken.success) {
        useUserStore.getState().updateToken(newToken.data)
      } else {
        useUserStore.getState().logout()
        navigateTo('/')
        message.error('登录已过期,请重新登录')
        return Promise.reject(error)
      }
      const newAccessToken = newToken.data.accessToken
      requestQueue.forEach(callback => callback(newAccessToken))
      return serverApi(originalRequest)
    } catch {
      return Promise.reject(error)
    } finally {
      requestQueue = []
      isRefreshing = false
    }
  }
)

export const aiApi = axios.create({
  baseURL: '/ai/v1',
  timeout,
})

aiApi.interceptors.response.use(res => res.data)

export interface Response<T = any> {
  timestamp: string
  path: string
  message: string
  code: number
  success: boolean
  data: T
}
