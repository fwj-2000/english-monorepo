import { useState } from "react"
import { useUserStore } from "@/stores/user"
import { sse, CHAT_URL } from "@/apis/sse"
import { getChatHistory } from "@/apis/chat"
import type { ChatRoleType, ChatMessageList, ChatDto, ChatMessage } from "@en/common/chat"
import Conversations from "./components/Conversations"
import Bubble from "./components/Bubble"

export function Chat() {
  const user = useUserStore((s) => s.user)
  const [list, setList] = useState<ChatMessageList>([])
  const [role, setRole] = useState<ChatRoleType>("normal")

  const getRole = async (params: ChatRoleType) => {
    setRole(params)
    if (user?.id) {
      const res = await getChatHistory(user.id, params)
      setList(res.data)
    }
  }

  const sendMessage = (message: string, deepThink: boolean, webSearch: boolean) => {
    if (!user?.id) return

    // 添加用户消息
    const userMsg: ChatMessage = { role: "human", content: message, type: "chat" }
    // 添加 AI 占位消息
    const aiMsg: ChatMessage = { role: "ai", content: "", reasoning: "", type: "chat" }
    setList((prev) => [...prev, userMsg, aiMsg])

    sse<ChatMessage, ChatDto>(
      CHAT_URL,
      "POST",
      { role, content: message, userId: user.id, deepThink, webSearch },
      (data) => {
        setList((prev) => {
          const newList = [...prev]
          const last = newList[newList.length - 1]
          if (!last) return prev
          if (data.type === "reasoning" && last.reasoning !== undefined) {
            last.reasoning += data.content
          }
          if (data.type === "chat" && last.content !== undefined) {
            last.content += data.content
          }
          return newList
        })
      }
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto mt-6">
      <Conversations onGetRole={getRole} />
      <Bubble list={list} onSendMessage={sendMessage} />
    </div>
  )
}
