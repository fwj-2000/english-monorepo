import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import Layout from '@/layout'
import { getAccessToken } from '@/stores/user'
import { useLoginDialogStore } from '@/stores/loginDialog'
import { Home } from '@/views/Home'
import { Chat } from '@/views/Chat'
import { Setting } from '@/views/Setting'
import { Course } from '@/views/Course'
import { WordBook } from '@/views/WordBook'
import { Copy } from '@/views/Copy'
import Learn from '@/views/Course/Learn'

// 认证守卫 —— 未登录弹登录框并跳首页
function RequireAuth() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    useLoginDialogStore.getState().show()
    return <Navigate to='/' replace />
  }
  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'chat', element: <RequireAuth />, children: [{ index: true, element: <Chat /> }] },
      {
        path: 'setting',
        element: <RequireAuth />,
        children: [{ index: true, element: <Setting /> }],
      },
      {
        path: 'courses',
        children: [
          { index: true, element: <Course /> },
          { path: 'learn/:courseId/:title', element: <Learn /> },
        ],
      },
      { path: 'word-book', element: <WordBook /> },
      { path: 'copy', element: <Copy /> },
    ],
  },
])

export default router
