import { useState, useEffect } from "react"
import { Modal, App } from "antd"
import dayjs from "dayjs"
import { uploadUrl } from "@/apis"
import { createPay } from "@/apis/pay"
import { useSocket } from "@/hooks/useSocket"
import type { Course } from "@en/common/course"
import type { CreatePayDto } from "@en/common/pay"

interface Props {
  visible: boolean
  course: Course | null
  onClose: () => void
}

export default function PayDialog({ visible, course, onClose }: Props) {
  const [isPay, setIsPay] = useState(false)
  const [timeExpire, setTimeExpire] = useState(0)
  const { getSocket } = useSocket()
  const { message } = App.useApp()

  // Socket 监听支付成功
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on("paymentSuccess", () => {
      if (visible) {
        message.success({ content: "支付成功", duration: 10 })
        onClose()
      }
    })
    return () => { socket.off("paymentSuccess") }
  }, [visible])

  const handleConfirm = async () => {
    if (!course) return
    const body: CreatePayDto = {
      subject: course.name,
      body: course.description || "",
      total_amount: course.price || "",
      courseId: course.id,
    }
    const res = await createPay(body)
    if (res.code === 200) {
      setIsPay(true)
      window.open(res.data.payUrl, "_blank")
      setTimeExpire(res.data.timeExpire)
    } else {
      message.error(res.message || "支付失败")
      setIsPay(false)
    }
  }

  const handleClose = () => {
    setTimeExpire(0)
    setIsPay(false)
    onClose()
  }

  return (
    <Modal open={visible} onCancel={handleClose} footer={null} centered width={480} destroyOnClose>
      <div className="px-2 pt-2 pb-4">
        <h2 className="text-lg font-semibold text-gray-800">确认支付</h2>
        <p className="mt-1 text-sm text-gray-500">请核对课程信息后完成支付</p>

        {course && (
          <div className="space-y-4 mt-4">
            <div className="flex gap-4 rounded-xl bg-gray-50 p-4">
              <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                <img src={uploadUrl + course.url} alt={course.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{course.name}</h3>
                <p className="mt-1 text-xs text-gray-400">讲师 {course.teacher}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-blue-50 px-4 py-3">
              <span className="text-sm text-gray-500">支付金额</span>
              <span className="text-xl font-bold text-blue-600">¥{course.price}</span>
            </div>
            {timeExpire > 0 && (
              <div className="flex flex-col items-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                <span className="text-sm text-gray-500">支付剩余时间</span>
                <span className="text-lg font-bold text-orange-600">
                  {dayjs(timeExpire).format("HH:mm:ss")}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50"
            disabled={isPay}
            onClick={handleConfirm}
          >
            {isPay ? "支付中..." : "确认支付"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
