# React 新手指南：三个核心难点

本文档面向有 Vue 3 经验但初次接触 React 的开发者，解释 `apps/react-web` 中最容易让人困惑的三个模块。

---

## 1. `apis/index.ts` — axios 拦截器 + token 自动刷新

### 它在干什么

这个文件创建了两个 axios 实例（`serverApi` 和 `aiApi`），核心功能是：
- 每次请求自动携带 accessToken
- 401 响应时自动用 refreshToken 换取新 accessToken
- 多个并发的 401 请求共享一次刷新，不会重复调用刷新接口

### 和 Vue 版的核心差异

Vue 版这样获取 token：
```ts
// Pinia store 可以在模块顶层直接调用
const userStore = useUserStore()
const token = userStore.getAccessToken  // 这是一个 computed 属性
```

React 版这样获取：
```ts
// Zustand 的 getState() 可以在组件外 / 模块顶层直接调用
import { getAccessToken, getRefreshToken } from "@/stores/user"
const token = getAccessToken() // 普通函数，不是 hook
```

**关键点**：`getState()` 是 Zustand 在组件外访问 store 的方式。React 的 `useStore()` hook 只能在组件里用，但 axios 拦截器是在模块顶层注册的，所以必须用 `getState()`。

### token 刷新队列

```
请求 A → 401
请求 B → 401   } 同时发生
请求 C → 401

isRefreshing = true
调用 refreshTokenApi
  → 成功：A、B、C 各自重试
  → 失败：清空队列，跳登录
isRefreshing = false
```

`requestQueue` 是一个闭包数组，每个元素是一个接收新 token 并重试的函数。这样避免了 3 个 401 触发 3 次 refreshTokenApi。

### 导航在 React 中的处理

Vue 版直接 `router.replace('/')`，因为 Vue Router 是全局单例。

React 版不能这样——`useNavigate()` 只能在组件内调用。所以用了 `@/routers/navigate.ts` 这个工具：
1. Layout 组件内部用 `useNavigate()` 获取 navigate 函数
2. `useEffect` 里调用 `setNavigate(navigate)` 注入全局
3. API 层调用 `navigateTo('/')` 跳转

---

## 2. `routers/index.tsx` — React Router 的路由 + 认证守卫

### createBrowserRouter vs Vue Router

Vue Router 是对象数组 + `createRouter`：
```ts
const routes = [{ path: '/', component: Home }]
const router = createRouter({ routes })
```

React Router v7 用 `createBrowserRouter` + JSX：
```tsx
const router = createBrowserRouter([{
  path: "/",
  element: <Layout />,   // 父路由的"布局组件"
  children: [
    { index: true, element: <Home /> },  // / 路径
    { path: "chat", element: <Chat /> }, // /chat 路径
  ]
}])
```

### `<Outlet />` 是什么

Vue Router 用 `<router-view />` 占位子路由。React Router 用 `<Outlet />`。

```tsx
// Layout 组件
export default function Layout() {
  return (
    <div>
      <Header />
      <Outlet />   // ← 子路由（Home / Chat / Setting…）渲染在这里
    </div>
  )
}
```

### RequireAuth — 认证守卫

Vue Router 用 `beforeEach` 做全局守卫。React Router v7 没有全局守卫，所以用了一个**布局组件**来模拟：

```tsx
function RequireAuth() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    useLoginDialogStore.getState().show() // 弹登录框
    return <Navigate to="/" replace />    // 跳首页
  }
  return <Outlet /> // 已登录，渲染子路由
}
```

把 `RequireAuth` 包在需要认证的路由外面：
```tsx
{ path: "setting", element: <RequireAuth />, children: [
  { index: true, element: <Setting /> }
]}
```

**这里的关键理解**：`RequireAuth` 返回 `<Outlet />` 时，它的 `children` 会渲染。返回 `<Navigate />` 时，页面直接跳转。这是在 React Router 里做认证守卫的最简洁方式。

---

## 3. `stores/user.ts` — Zustand + persist（对标 Pinia）

### 从 Pinia 到 Zustand 的对照

**Pinia（Vue）：**
```ts
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  function setUser(params) { user.value = params }
  return { user, setUser }
}, { persist: true })
```

**Zustand（React）：**
```ts
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (params) => set({ user: params }),
    }),
    { name: 'user-storage' }  // localStorage key
  )
)
```

核心差异：
- Pinia 用 `ref()` → 直接 `user.value = xxx` 赋值
- Zustand 用 `set()` → `set({ user: params })`，**必须创建新对象**（不可变更新）
- Pinia 的 `persist: true` → Zustand 的 `persist(store, { name: '...' })`

### 更新嵌套字段

Vue 里可以这样直接改：
```ts
user.value.token = newToken  // Pinia 响应式直接生效
```

React/Zustand 必须不可变更新：
```ts
updateToken: (newToken) =>
  set((state) => ({
    user: { ...state.user, token: newToken }  // 展开旧对象 + 覆盖新字段
  })),
```

### 组件外的 getter 函数

```ts
export const getAccessToken = () =>
  useUserStore.getState().user?.token.accessToken ?? null

export const getRefreshToken = () =>
  useUserStore.getState().user?.token.refreshToken ?? null
```

这些是**普通函数，不是 hook**。在 axios 拦截器（模块顶层代码）里直接调用，不需要在组件内。

### 组件内使用

```tsx
// 选择整个 user 对象
const user = useUserStore((s) => s.user)

// 只选择 name（避免不必要的 re-render）
const name = useUserStore((s) => s.user?.name)

// 调用 action
const login = useUserStore((s) => s.setUser)
```
