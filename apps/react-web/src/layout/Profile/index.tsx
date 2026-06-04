import { useNavigate } from 'react-router'
import { Modal } from 'antd'
import { useUserStore } from '@/stores/user'
import { useAvatar } from '@/hooks/useAvatar'
import { useLogin } from '@/hooks/useLogin'

export default function AppProfile() {
  const navigate = useNavigate()
  const { avatar } = useAvatar()
  const { login, logout } = useLogin()
  const user = useUserStore(s => s.user)
  const isLoggedIn = !!user
  const displayName = user?.name ?? '游客'
  const bio = user?.bio ?? ''

  const gotoPath = (path: string) => navigate(path)

  const logoutHandle = () => {
    Modal.confirm({
      title: '提示',
      content: '确定退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => logout(),
    })
  }

  return (
    <section className='w-80 rounded-2xl bg-white overflow-hidden'>
      {/* 头像 + 信息 */}
      <div className='flex items-center gap-3 px-4 pt-4 pb-3'>
        <img
          className='w-11 h-11 rounded-full border border-gray-200 object-cover shrink-0'
          src={avatar}
          alt={displayName}
        />
        <div className='min-w-0 flex-1'>
          <div className='text-sm font-semibold text-gray-800 truncate' title={displayName}>
            {displayName}
          </div>
          {bio && (
            <div className='text-xs text-gray-400 truncate mt-0.5' title={bio}>
              {bio}
            </div>
          )}
          {!isLoggedIn && (
            <div className='text-xs text-gray-400 mt-1'>登录后可同步词库进度与打卡数据</div>
          )}
        </div>
      </div>

      {/* 统计数据 */}
      {isLoggedIn && (
        <div className='grid grid-cols-2 gap-2 px-4 pb-3'>
          <div className='rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5'>
            <div className='text-xs text-gray-400'>单词数量</div>
            <div className='mt-1 text-lg font-bold text-gray-800'>{user?.wordNumber ?? 0}</div>
          </div>
          <div className='rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5'>
            <div className='text-xs text-gray-400'>打卡天数</div>
            <div className='mt-1 text-lg font-bold text-gray-800'>{user?.dayNumber ?? 0}</div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className='flex gap-2 border-t border-gray-200 px-4 py-3'>
        {!isLoggedIn ? (
          <button
            className='flex-1 h-10 text-sm bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700'
            type='button'
            onClick={() => login()}
          >
            去登录
          </button>
        ) : (
          <>
            <button
              className='flex-1 h-10 text-sm border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50'
              type='button'
              onClick={() => gotoPath('/setting')}
            >
              个人资料
            </button>
            <button
              className='flex-1 h-10 text-sm border border-red-200 text-red-500 rounded-lg cursor-pointer hover:bg-red-50'
              type='button'
              onClick={logoutHandle}
            >
              退出登录
            </button>
          </>
        )}
      </div>
    </section>
  )
}
