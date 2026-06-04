import { useNavigate, useLocation } from 'react-router'
import { Popover } from 'antd'
import {
  HomeOutlined,
  RobotOutlined,
  BookOutlined,
  ReadOutlined,
  SettingOutlined,
  SunOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/stores/user'
import { useAvatar } from '@/hooks/useAvatar'
import { useLogin } from '@/hooks/useLogin'
import Profile from '@/layout/Profile'

interface NavRoute {
  path: string
  name: string
  icon: React.ReactNode
  isAuth: boolean
}

const routes: NavRoute[] = [
  { path: '/', name: '首页', icon: <HomeOutlined />, isAuth: false },
  { path: '/chat', name: 'AI', icon: <RobotOutlined />, isAuth: true },
  { path: '/word-book', name: '词库', icon: <BookOutlined />, isAuth: false },
  { path: '/courses', name: '课程', icon: <ReadOutlined />, isAuth: false },
  { path: '/setting', name: '设置', icon: <SettingOutlined />, isAuth: true },
]

export default function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { avatar } = useAvatar()
  const { login } = useLogin()
  const user = useUserStore(s => s.user)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const gotoPath = async (route: NavRoute) => {
    if (route.isAuth && !user) {
      try {
        await login()
      } catch {
        return // 用户取消登录
      }
    }
    navigate(route.path)
  }

  return (
    <header className='flex items-center h-16 border-b border-gray-200 justify-center sticky top-0 bg-white/95 backdrop-blur z-50'>
      <div className='w-full max-w-6xl flex items-center justify-between px-6'>
        {/* Logo */}
        <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
          <div className='w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold'>
            E
          </div>
          <span className='text-lg font-semibold text-gray-800'>English App</span>
        </div>

        {/* 导航 */}
        <nav className='flex items-center gap-1'>
          {routes.map(route => (
            <button
              key={route.path}
              onClick={() => gotoPath(route)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors duration-150 ${
                isActive(route.path)
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className='text-lg'>{route.icon}</span>
              <span>{route.name}</span>
            </button>
          ))}
        </nav>

        {/* 右侧：统计 + 用户 */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium'>
            <SunOutlined />
            <span>{user?.wordNumber ?? 0}</span>
          </div>
          <div className='flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-500 rounded-full text-sm font-medium'>
            <StarOutlined />
            <span>{user?.dayNumber ?? 0}</span>
          </div>

          <Popover content={<Profile />} trigger='click' placement='bottomRight'>
            <div className='flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer'>
              <img className='w-9 h-9 rounded-full object-cover' src={avatar} />
              <span className='text-sm font-medium text-gray-500'>{user?.name ?? '游客'}</span>
            </div>
          </Popover>
        </div>
      </div>
    </header>
  )
}
