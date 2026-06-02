// 导航工具——React Router 不能在组件外调用 useNavigate，
// 所以在 App 挂载时注入 navigate 实例，供 API 层等全局模块使用
let _navigate: ((to: string) => void) | null = null

export const setNavigate = (fn: (to: string) => void) => {
  _navigate = fn
}

export const navigateTo = (to: string) => {
  if (_navigate) {
    _navigate(to)
  } else {
    // 兜底：直接改 location
    window.location.href = to
  }
}
