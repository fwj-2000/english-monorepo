import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Tabs, Empty } from 'antd'
import { getCourseList, getMyCourse } from '@/apis/course'
import { uploadUrl } from '@/apis'
import type { Course as CourseType, CourseList } from '@en/common/course'
import { useLogin } from '@/hooks/useLogin'
import { useUserStore } from '@/stores/user'
import PayDialog from './components/Pay'

export function Course() {
  const [currentTab, setCurrentTab] = useState('list')
  const [list, setList] = useState<CourseList>([])
  const [payVisible, setPayVisible] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null)
  const navigate = useNavigate()
  const { login } = useLogin()
  const user = useUserStore(s => s.user)

  const getList = async (tab: string) => {
    const res = await (tab === 'list' ? getCourseList() : getMyCourse())
    setList(res.data)
  }

  useEffect(() => {
    getList(currentTab)
  }, [currentTab])

  const openPay = async (course: CourseType) => {
    await login()
    if (currentTab === 'list') {
      setSelectedCourse(course)
      setPayVisible(true)
    } else {
      navigate(`/courses/learn/${course.id}/${course.name}`)
    }
  }

  return (
    <div className='max-w-6xl mx-auto pt-12 pb-24'>
      <header className='mb-12 text-center'>
        <p className='text-sm font-medium text-blue-600 tracking-wide mb-2'>Vocabulary Courses</p>
        <h1 className='text-3xl font-bold text-gray-800 tracking-tight sm:text-4xl'>精选课程</h1>
        <p className='mt-3 text-gray-500 text-sm max-w-md mx-auto'>
          一次购买，长期有效 · 覆盖高考、考研、四六级、托福雅思等
        </p>
      </header>

      <Tabs
        activeKey={currentTab}
        onChange={key => setCurrentTab(key)}
        items={[
          { key: 'list', label: '精选课程' },
          ...(user?.id ? [{ key: 'my', label: '我的课程' }] : []),
        ]}
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {list.map(item => (
          <article
            key={item.id}
            className='group bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col'
          >
            <div className='relative aspect-4/3 bg-gray-100 overflow-hidden'>
              <img
                src={uploadUrl + item.url}
                alt={item.name}
                className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
              />
              <div className='absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-gray-500 shadow-sm'>
                词汇
              </div>
            </div>
            <div className='p-5 flex-1 flex flex-col'>
              <h2 className='text-base font-semibold text-gray-800 line-clamp-1'>{item.name}</h2>
              <p className='mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1'>
                {item.description}
              </p>
              <div className='mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-3'>
                <span className='text-xs text-gray-400 truncate'>讲师 {item.teacher}</span>
                <span className='text-lg font-bold text-blue-600 shrink-0'>¥{item.price}</span>
              </div>
              <button
                type='button'
                onClick={() => openPay(item)}
                className='mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 transition-colors cursor-pointer'
              >
                {currentTab === 'list' ? '购买课程' : '学习课程'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {list.length === 0 && <Empty description='暂无课程' />}

      <PayDialog
        visible={payVisible}
        course={selectedCourse}
        onClose={() => setPayVisible(false)}
      />
    </div>
  )
}
