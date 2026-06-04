import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Layout as AntLayout } from 'antd'
import AppHeader from './Header'
import AppContent from './Content'
import LoginDialog from '@/components/Login/LoginDialog'
import { setNavigate } from '@/routers/navigate'
import './index.css'

export default function Layout() {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <AntLayout className='min-h-screen'>
      <AppHeader />
      <AntLayout>
        <AppContent>
          <Outlet />
        </AppContent>
      </AntLayout>
      {/* 全局登录弹窗 */}
      <LoginDialog />
    </AntLayout>
  )
}
