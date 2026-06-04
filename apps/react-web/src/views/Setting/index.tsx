import { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Switch,
  Upload,
  Card,
  Row,
  Col,
  Tag,
  TimePicker,
  Modal,
  App,
} from 'antd'
import { useUserStore } from '@/stores/user'
import { useAvatar } from '@/hooks/useAvatar'
import { useLogin } from '@/hooks/useLogin'
import { uploadAvatar, updateUser } from '@/apis/user'
import type { UserUpdate } from '@en/common/user'

export function Setting() {
  const [form] = Form.useForm<UserUpdate>()
  const { message } = App.useApp()
  const { customAvatar } = useAvatar()
  const { logout } = useLogin()
  const user = useUserStore(s => s.user)
  const updateUserStore = useUserStore(s => s.updateUser)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        isTimingTask: user.isTimingTask,
        timingTaskTime: user.timingTaskTime,
        address: user.address,
        bio: user.bio,
        avatar: user.avatar ?? undefined,
      })
      setPreviewUrl(customAvatar(user.avatar ?? ''))
    }
  }, [user])

  const handleAvatarChange = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadAvatar(fd)
    if (res.success && res.data) {
      form.setFieldValue('avatar', res.data.databaseUrl)
      setPreviewUrl(res.data.previewUrl)
    } else {
      message.error(res.message || '上传失败')
    }
  }

  const handleSave = async () => {
    const values = form.getFieldsValue()
    const res = await updateUser(values)
    if (res.success && res.data) {
      updateUserStore(res.data)
      message.success('更新成功')
    } else {
      message.error(res.message || '保存失败')
    }
  }

  const handleLogout = () =>
    Modal.confirm({
      title: '提示',
      content: '确定退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => logout(),
    })

  return (
    <div className='max-w-4xl mx-auto py-8'>
      <div className='flex justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>设置</h1>
          <p className='text-sm text-gray-400'>修改个人信息与头像</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => form.resetFields()}>重置</Button>
          <Button type='primary' onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
      <Row gutter={16}>
        <Col span={8}>
          <Card title='头像' className='mb-4'>
            <div className='flex items-center gap-4'>
              <img
                className='w-20 h-20 rounded-full border-2 border-gray-200 object-cover'
                src={previewUrl || customAvatar('')}
              />
              <div className='flex flex-col gap-2'>
                <Upload
                  showUploadList={false}
                  accept='image/*'
                  beforeUpload={f => {
                    handleAvatarChange(f)
                    return false
                  }}
                >
                  <Button type='primary'>选择头像</Button>
                </Upload>
                <div className='text-xs text-gray-400'>支持 png/jpg/webp</div>
              </div>
            </div>
          </Card>
          <Card title='账号'>
            <div className='text-sm text-gray-500'>
              <span>登录状态</span>
              <Tag color='success' className='ml-2'>
                已登录
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Card title='个人信息' className='mb-4'>
              <Form.Item
                name='name'
                label='用户名'
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name='email' label='邮箱'>
                <Input />
              </Form.Item>
              <Form.Item name='isTimingTask' label='定时任务' valuePropName='checked'>
                <Switch />
              </Form.Item>
              <Form.Item name='timingTaskTime' label='定时时间'>
                <TimePicker format='HH:mm:ss' style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name='address' label='地址'>
                <Input />
              </Form.Item>
              <Form.Item name='bio' label='签名'>
                <Input.TextArea rows={4} maxLength={120} showCount />
              </Form.Item>
            </Card>
          </Form>
          <Card title='危险操作'>
            <div className='flex justify-between'>
              <div>
                <b>退出登录</b>
                <div className='text-sm text-gray-400'>清除本地登录状态</div>
              </div>
              <Button danger onClick={handleLogout}>
                退出
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
