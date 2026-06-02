# React Web 迁移方案（执行版）

## 已完成

| 模块 | 状态 | 说明 |
|---|---|---|
| 项目脚手架 | ✅ | Vite 8 + React 19 + TS 6 + Tailwind 4 |
| apis/ 接口层 | ✅ | axios + token refresh 队列 + SSE |
| stores/ 状态管理 | ✅ | Pinia → Zustand (user / counter / loginDialog) |
| routers/ 路由 | ✅ | Vue Router → React Router v7 + RequireAuth |
| layout/ 布局 | ✅ | Header (导航 + 头像下拉) + Profile + Content |
| hooks/ | ✅ | useAvatar / useLogin |

## P1：登录流程（当前执行中）

| 文件 | Vue 源 | React 目标 | 关键差异 |
|---|---|---|---|
| LoginDialog | Login/index.vue | LoginDialog.tsx | provide/inject → Zustand; el-dialog → Modal; CSS Transition → antd Motion |
| LoginForm | LoginForm.vue | LoginForm.tsx | el-form+v-model → Ant Design Form+Form.Item |
| RegisterForm | RegisterForm.vue | RegisterForm.tsx | 同上 |
| ModelViewer | ModelViewer.vue | ModelViewer.tsx | Three.js GLB: onMounted → useEffect |

| 文件 | Vue 源 | React 目标 | 关键差异 |
|---|---|---|---|
| Setting | views/Setting/index.vue | views/Setting/index.tsx | el-card→Card, el-form→Form, el-upload→Upload, el-switch→Switch, el-time-picker→TimePicker |

## P2：中等复杂度页面

- WordBook (4KB)
- Search (3KB)
- Course + Pay (15KB)
- Home + Hologram (11KB, Three.js)

## P3：最复杂页面

- Chat + Bubble + Conversations (12KB, SSE/语音/3D)
- Course/Learn (9KB, 音频/拼写/答题)
