import { useState, useEffect } from "react"
import { getChatMode } from "@/apis/chat"
import type { ChatModeList, ChatMode, ChatRoleType } from "@en/common/chat"
import {
  CommentOutlined, EditOutlined, FileTextOutlined,
  AudioOutlined, MessageOutlined,
} from "@ant-design/icons"

const modeIconMap: Record<string, React.ReactNode> = {
  "语法": <EditOutlined />,
  "写作": <FileTextOutlined />,
  "面试": <AudioOutlined />,
  "对话": <CommentOutlined />,
}

interface Props {
  onGetRole: (role: ChatRoleType) => void
}

export default function Conversations({ onGetRole }: Props) {
  const [chatMode, setChatMode] = useState<ChatModeList>([])
  const [active, setActive] = useState<string | null>(null)

  const getChatModeList = async () => {
    const res = await getChatMode()
    setChatMode(res.data)
    const firstId = res.data[0]?.id ?? null
    setActive(firstId)
    if (res.data[0]?.role) onGetRole(res.data[0].role)
  }

  useEffect(() => { getChatModeList() }, [])

  const changeActive = (mode: ChatMode) => {
    setActive(mode.id)
    onGetRole(mode.role)
  }

  const getIcon = (label: string) => {
    for (const key of Object.keys(modeIconMap)) {
      if (label.includes(key)) return modeIconMap[key]
    }
    return <MessageOutlined />
  }

  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-gray-800">对话模式</h2>
        <p className="text-xs text-gray-400 mt-1">选择适合你的 AI 角色</p>
      </div>
      <nav className="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
        {chatMode.map((mode) => (
          <button
            key={mode.id}
            onClick={() => changeActive(mode)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer ${
              active === mode.id
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{getIcon(mode.label)}</span>
            <span className="text-sm">{mode.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
