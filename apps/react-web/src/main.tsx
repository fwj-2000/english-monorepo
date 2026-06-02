import { createRoot } from "react-dom/client"
import { ConfigProvider, App } from "antd"
import zhCN from "antd/locale/zh_CN"
import AppRoot from "./App"
import "./assets/css/index.css"

createRoot(document.getElementById("root")!).render(
  <ConfigProvider locale={zhCN}>
    <App>
      <AppRoot />
    </App>
  </ConfigProvider>
)
