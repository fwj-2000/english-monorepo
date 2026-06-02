# React Web 迁移方案

## 总体策略

在 pps/react-web 目录下新建 React 项目，复用 monorepo 已有的 @en/common（业务类型）、@en/config（端口/配置）、server/（后端 API 完全不变），只重写框架层：Vue → React。

## 技术选型

| 领域 | Vue 版 | React 版 |
|---|---|---|
| 构建 | Vite 8 + @vitejs/plugin-vue | Vite 8 + @vitejs/plugin-react |
| UI 框架 | Element Plus | Ant Design 5 |
| 状态管理 | Pinia + persistedstate | Zustand + persist 中间件 |
| 路由 | Vue Router 5 | React Router 7 |
| HTTP | axios | axios（不变） |
| SSE | @microsoft/fetch-event-source | 不变 |
| 实时通信 | socket.io-client | 不变 |
| CSS | Tailwind CSS 4 | 不变 |
| 动画 | GSAP | 不变 |
| 3D | Three.js | 不变 |
| 共享包 | @en/common @en/config | 直接复用 workspace:* |

## 目录结构

apps/react-web/
├── public/
├── src/
│   ├── apis/                # 接口层，与 Vue 版 1:1 对应
│   ├── assets/
│   ├── components/          # 通用组件
│   ├── hooks/               # 自定义 Hooks
│   ├── layout/              # 布局组件
│   ├── routers/             # React Router 配置
│   ├── stores/              # Zustand stores
│   ├── views/               # 页面组件
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts

## Vue → React 核心映射

| Vue 3 (Composition API) | React (Function Component) |
|---|---|
| ref(0) | useState(0) |
| computed(() => a+b) | useMemo(() => a+b, [a,b]) |
| watch(source, fn) | useEffect(() => fn(), [source]) |
| onMounted(fn) | useEffect(fn, []) |
| v-if="show" | {show && <div>} |
| v-for="item in list" | {list.map(item => <div key={item.id}>)} |
| v-model="val" | value={val} onChange={...} |
| @click="fn" | onClick={fn} |
| defineProps<T>() | function Comp({ name }: Props) |
| <slot /> | {children} |
| Pinia store | Zustand store |
| router.push() | useNavigate() |

## 重写阶段

1. 脚手架搭建
2. apis/ 接口层迁移
3. stores/ 状态管理迁移
4. routers/ 路由迁移
5. layout/ 布局迁移
6. components/ 通用组件迁移
7. views/ 页面迁移
8. 联调验证

## 假设

- React 版端口：8081（Vue 版 8080 不变）
- package.json name：@en/react-web
- Ant Design 5.x、React Router 7.x、Zustand 5.x
