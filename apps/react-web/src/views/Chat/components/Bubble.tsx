import { useState, useRef, useEffect } from "react"
import { Input, Switch } from "antd"
import { AudioOutlined, UserOutlined, RobotOutlined, DashboardOutlined, MessageOutlined } from "@ant-design/icons"
import { marked } from "marked"
import type { ChatMessageList } from "@en/common/chat"

interface Props {
  list: ChatMessageList
  onSendMessage: (message: string, deepThink: boolean, webSearch: boolean) => void
}

export default function Bubble({ list, onSendMessage }: Props) {
  const [message, setMessage] = useState("")
  const [deepThink, setDeepThink] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [list])

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false; rec.continuous = false
    setIsRecording(true)
    rec.onresult = (e: any) => { setMessage(p => p + " " + e.results[0][0].transcript); setIsRecording(false) }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    rec.start()
  }

  const handleSend = () => { const t = message.trim(); if (!t) return; onSendMessage(t, deepThink, webSearch); setMessage("") }
  const parseMarkdown = (text: string) => marked(text) as string

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        {!list?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4"><MessageOutlined /></div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">开始你的英语学习之旅</h3>
            <p className="text-sm text-gray-400 max-w-xs">选择左侧对话模式，然后用英语或中文与 AI 交流</p>
          </div>
        ) : list.map((item, i) => (
          <div key={i} className="mb-6">
            {item.role === "human" ? (
              <div className="flex justify-end gap-3">
                <div className="max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-sm">{item.content}</div>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><UserOutlined className="text-blue-600" /></div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0"><RobotOutlined className="text-white" /></div>
                <div className="max-w-[75%] min-w-0">
                  {item.reasoning && (
                    <details className="mb-2 group"><summary className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer hover:text-gray-500"><DashboardOutlined /> 深度思考</summary>
                    <div className="mt-2 p-3 rounded-lg bg-gray-50 border text-xs text-gray-500 whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: parseMarkdown(item.reasoning)}} /></details>
                  )}
                  {item.content && <div className="text-sm text-gray-700 bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm" dangerouslySetInnerHTML={{__html: parseMarkdown(item.content)}} />}
                  {item.role === "ai" && !item.content && !item.reasoning && (<div className="flex items-center gap-1 text-gray-400 text-sm"><span>思考中</span><span className="animate-pulse">...</span></div>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">深度思考</span><Switch size="small" checked={deepThink} onChange={setDeepThink} />
          <span className="text-xs text-gray-400 ml-4">联网搜索</span><Switch size="small" checked={webSearch} onChange={setWebSearch} />
        </div>
        <div className="flex items-center gap-2">
          <Input.TextArea value={message} onChange={e => setMessage(e.target.value)} onPressEnter={e => { if(!e.shiftKey){ e.preventDefault(); message.trim() && handleSend() }}} placeholder="用英语或中文与 AI 交流..." autoSize={{ minRows: 1, maxRows: 4 }} className="flex-1" />
          {!isRecording ? (<button type="button" className="p-2 text-gray-400 hover:text-blue-500" onClick={startVoice} title="语音输入"><AudioOutlined className="text-lg" /></button>) : (<span className="text-red-500 animate-pulse text-sm">录音中...</span>)}
        </div>
      </div>
    </div>
  )
}
