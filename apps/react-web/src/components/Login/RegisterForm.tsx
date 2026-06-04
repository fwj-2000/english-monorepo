import { Form, Input, Button, App } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import md5 from 'md5'
import { register } from '@/apis/user'
import { useUserStore } from '@/stores/user'
import { useLoginDialogStore } from '@/stores/loginDialog'

interface RegisterFormData {
  name: string
  phone: string
  email?: string
  password: string
}

export default function RegisterForm() {
  const [form] = Form.useForm<RegisterFormData>()
  const { hide } = useLoginDialogStore()
  const setUser = useUserStore(s => s.setUser)
  const { message } = App.useApp()

  const handleFinish = async (values: RegisterFormData) => {
    const res = await register({
      ...values,
      password: md5(values.password),
    })
    if (res.success) {
      setUser(res.data)
      message.success('注册成功')
      hide()
    } else {
      message.error(res.message || '注册失败')
    }
  }

  return (
    <div>
      <div className='mb-8 text-center'>
        <h1 className='text-xl font-bold text-gray-800'>加入 English App</h1>
        <p className='mt-1 text-sm text-gray-400'>开始你的英语学习之旅</p>
      </div>

      <Form form={form} layout='vertical' onFinish={handleFinish} size='large'>
        <Form.Item
          name='name'
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 2, max: 10, message: '用户名长度为2-10位' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder='请输入用户名' />
        </Form.Item>

        <Form.Item
          name='phone'
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input prefix={<UserOutlined />} maxLength={11} placeholder='请输入手机号' />
        </Form.Item>

        <Form.Item name='email'>
          <Input prefix={<MailOutlined />} placeholder='请输入邮箱(选填)' />
        </Form.Item>

        <Form.Item
          name='password'
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, max: 32, message: '密码长度为8-32位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder='请输入密码(至少8位)' />
        </Form.Item>

        <Form.Item className='pt-4'>
          <Button type='primary' htmlType='submit' block size='large' className='font-semibold'>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
