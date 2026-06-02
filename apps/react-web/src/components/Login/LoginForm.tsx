import { Form, Input, Button, App } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import md5 from "md5"
import { login } from "@/apis/user"
import { useUserStore } from "@/stores/user"
import { useLoginDialogStore } from "@/stores/loginDialog"

interface LoginFormData {
  phone: string
  password: string
}

export default function LoginForm() {
  const [form] = Form.useForm<LoginFormData>()
  const { hide } = useLoginDialogStore()
  const setUser = useUserStore((s) => s.setUser)
  const { message } = App.useApp()

  const handleFinish = async (values: LoginFormData) => {
    const res = await login({
      phone: values.phone,
      password: md5(values.password),
    })
    if (res.success) {
      setUser(res.data)
      message.success("登录成功")
      hide()
    } else {
      message.error(res.message || "登录失败")
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-800">登录 English App</h1>
        <p className="mt-1 text-sm text-gray-400">继续你的英语学习之旅</p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish} size="large">
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "请输入手机号" },
            { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
          ]}
        >
          <Input prefix={<UserOutlined />} maxLength={11} placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 8, message: "密码长度至少为8位" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
        </Form.Item>

        <Form.Item className="pt-4">
          <Button type="primary" htmlType="submit" block size="large" className="font-semibold">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
