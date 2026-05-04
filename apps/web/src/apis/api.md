# API 请求模块技术文档

## 目录

1. [模块概述](#模块概述)
2. [核心配置](#核心配置)
3. [请求拦截器](#请求拦截器)
4. [响应拦截器与错误处理](#响应拦截器与错误处理)
5. [并发请求处理机制](#并发请求处理机制)
6. [Token 刷新机制](#token-刷新机制)

---

## 模块概述

本模块基于 `axios` 封装了项目的 HTTP 请求层，主要提供：

- 统一的 API 请求实例
- 自动 Token 注入
- 智能 Token 刷新
- 并发请求防重复刷新
- 统一的响应格式处理

---

## 核心配置

### axios 实例创建

```typescript
export const serverApi = axios.create({
  baseURL: '/api/v1',
  timeout: 50000,
})
```

| 配置项  | 说明                                   |
| ------- | -------------------------------------- |
| baseURL | API 基础路径，所有请求会自动添加此前缀 |
| timeout | 请求超时时间，单位毫秒（50秒）         |

---

## 请求拦截器

### 功能说明

在每次发送请求前，自动将 Access Token 注入到请求头中。

### 代码实现

```typescript
serverApi.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.getAccessToken) {
    config.headers.Authorization = `Bearer ${userStore.getAccessToken}`
  }
  return config
})
```

### 执行流程

1. 从 Pinia Store 获取当前用户的 Access Token
2. 如果 Token 存在，添加到 `Authorization` 请求头，格式为 `Bearer {token}`
3. 返回配置对象继续发送请求

---

## 响应拦截器与错误处理

### 正常响应处理

```typescript
serverApi.interceptors.response.use(res => {
  return res.data
})
```

直接返回响应体中的 `data` 字段，简化调用方的数据获取。

---

## 并发请求处理机制

### 问题背景

**为什么会出现并发问题？**

在实际应用中，一个页面可能同时发起多个 API 请求（例如：获取用户信息、获取列表数据、获取配置等）。当 Access Token 过期时，这些请求会几乎同时收到 401 错误。

如果不做特殊处理，会导致：

1. **重复刷新 Token**：多个请求同时调用刷新接口
2. **Refresh Token 失效**：很多后端的 Refresh Token 只能使用一次，后续刷新请求会失败
3. **用户体验差**：部分请求成功，部分请求失败

### 解决方案

通过两个核心变量实现并发控制：

```typescript
let isRefreshing = false // 是否正在刷新 Token 的标记
let requestQueue: ((newAccessToken: string) => void)[] = [] // 存储等待中的请求队列
```

#### 核心逻辑

```typescript
if (isRefreshing) {
  return new Promise(resolve => {
    requestQueue.push((newAccessToken: string) => {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      resolve(serverApi(originalRequest))
    })
  })
}
```

#### 工作原理

1. **第一个 401 请求**：
   - `isRefreshing` 为 `false`
   - 开始执行 Token 刷新流程
   - 设置 `isRefreshing = true`

2. **后续的 401 请求**：
   - 检测到 `isRefreshing` 为 `true`
   - 不立即刷新，而是返回一个 Promise
   - 将一个回调函数推入 `requestQueue` 队列
   - 这个回调函数包含了：更新请求头、重试请求、resolve 结果

3. **刷新成功后**：
   - 遍历 `requestQueue`，依次执行所有回调函数
   - 每个回调函数拿到新 Token 后重试原请求
   - 清空队列，重置 `isRefreshing` 状态

#### 时序图

```
请求1 → 401 → isRefreshing=false → 开始刷新 Token ← 第一个请求负责刷新
请求2 → 401 → isRefreshing=true → 存入队列[0] → 等待
请求3 → 401 → isRefreshing=true → 存入队列[1] → 等待
       ↓
请求1: 刷新成功，获取 newAccessToken
       ↓
       执行队列[0](newAccessToken) → 请求2 重试成功
       执行队列[1](newAccessToken) → 请求3 重试成功
       ↓
       请求1 自己也重试成功
       ↓
       清空队列，重置 isRefreshing=false
```

---

## Token 刷新机制

### 完整流程

```typescript
isRefreshing = true
try {
  const newToken = await refreshTokenApi({ refreshToken: refreshToken })
  if (newToken.success) {
    userStore.updateToken(newToken.data)
  } else {
    userStore.logout()
    router.replace('/')
    return Promise.reject(error)
  }
  const newAccessToken = newToken.data.accessToken
  requestQueue.forEach(callback => callback(newAccessToken))
  return serverApi(originalRequest)
} catch (error) {
  return Promise.reject(error)
} finally {
  requestQueue = []
  isRefreshing = false
}
```

### 步骤详解

| 步骤            | 说明                                                             |
| --------------- | ---------------------------------------------------------------- |
| 1. 锁定状态     | 设置 `isRefreshing = true`，防止其他请求重复刷新                 |
| 2. 调用刷新接口 | 使用 `refreshToken` 调用 `refreshTokenApi` 获取新 Token          |
| 3. 更新 Store   | 刷新成功后，将新 Token 更新到 Pinia Store 中                     |
| 4. 刷新失败处理 | 如果刷新失败（如 refreshToken 也过期），清空用户信息并跳转到首页 |
| 5. 执行队列     | 遍历 `requestQueue`，将新 Token 传给每个等待的请求并执行         |
| 6. 重试原请求   | 重试当前这个失败的请求                                           |
| 7. 清理状态     | `finally` 块中清空队列，重置 `isRefreshing` 状态                 |

### 登出逻辑

```typescript
if (!refreshToken) {
  userStore.logout()
  router.replace('/')
  return Promise.reject(error)
}
```

当没有 Refresh Token 时，说明无法再刷新了，直接执行登出：

- 清空用户 Store 中的所有信息
- 跳转到首页（登录页）

---

## Response 类型定义

```typescript
export interface Response<T = any> {
  timestamp: string
  path: string
  message: string
  code: number
  success: boolean
  data: T
}
```

统一的后端响应格式，包含：

- `timestamp`: 响应时间戳
- `path`: 请求路径
- `message`: 响应消息
- `code`: 状态码
- `success`: 是否成功
- `data`: 响应数据（泛型支持）

---

## 最佳实践

### 使用示例

```typescript
import { serverApi, Response } from '@/apis'

// 获取用户信息
const getUserInfo = async () => {
  const res: Response<UserInfo> = await serverApi.get('/user/info')
  return res.data
}

// 提交数据
const submitData = async (data: any) => {
  const res: Response = await serverApi.post('/submit', data)
  return res
}
```

### 注意事项

1. **不要手动处理 401**：拦截器已经自动处理了 Token 刷新和重试
2. **合理设置超时时间**：50秒适用于大多数场景，特殊接口可单独配置
3. **Refresh Token 安全**：Refresh Token 应妥善存储，建议使用 HttpOnly Cookie
