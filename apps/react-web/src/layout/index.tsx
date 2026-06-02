import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import { Layout as AntLayout } from "antd"
import AppHeader from "./Header"
import AppContent from "./Content"
import { setNavigate } from "@/routers/navigate"
import "./index.css"

export default function Layout() {
  const navigate = useNavigate()

  // 注入 navigate 供 API 层（axios 拦截器）等非组件代码调用
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <AntLayout className="min-h-screen">
      <AppHeader />
      <AntLayout>
        <AppContent>
          <Outlet />
        </AppContent>
      </AntLayout>
    </AntLayout>
  )
}
