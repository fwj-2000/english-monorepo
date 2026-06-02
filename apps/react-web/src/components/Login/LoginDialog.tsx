import { useState } from "react"
import { Modal } from "antd"
import { useLoginDialogStore } from "@/stores/loginDialog"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

export default function LoginDialog() {
  const [loginType, setLoginType] = useState<"login" | "register">("login")
  const { visible, hide } = useLoginDialogStore()

  return (
    <Modal
      open={visible}
      onCancel={hide}
      footer={null}
      width={480}
      centered
      destroyOnClose
      maskClosable
    >
      {/* 登录/注册切换 */}
      <div className="flex border-b border-gray-200 -mx-6 -mt-2 mb-6">
        <button
          onClick={() => setLoginType("login")}
          className={
            loginType === "login"
              ? "flex-1 py-4 text-center text-sm font-semibold text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "flex-1 py-4 text-center text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          }
        >
          登录
        </button>
        <button
          onClick={() => setLoginType("register")}
          className={
            loginType === "register"
              ? "flex-1 py-4 text-center text-sm font-semibold text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "flex-1 py-4 text-center text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          }
        >
          注册
        </button>
      </div>

      {loginType === "login" ? <LoginForm /> : <RegisterForm />}
    </Modal>
  )
}
