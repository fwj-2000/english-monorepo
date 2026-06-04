import '@/assets/base.css'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppRoot from './App'

createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN}>
    <App>
      <AppRoot />
    </App>
  </ConfigProvider>
)
