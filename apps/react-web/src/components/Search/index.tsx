import { useState, useEffect, useCallback } from "react"
import { Input, App } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { getWordBookList } from "@/apis/word-book"
import type { Word } from "@en/common/word"

export default function Search() {
  const [isShow, setIsShow] = useState(false)
  const [search, setSearch] = useState("")
  const [wordList, setWordList] = useState<Word[]>([])
  const { message } = App.useApp()

  const getList = useCallback(async (keyword: string) => {
    const res = await getWordBookList({ word: keyword, page: 1, pageSize: 20 })
    if (res.success) {
      setWordList(res.data.list)
    }
  }, [])

  // 防抖搜索
  useEffect(() => {
    if (!isShow) return
    const timer = setTimeout(() => {
      if (search) getList(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search, isShow, getList])

  // 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault()
        setIsShow(true)
        document.body.style.overflow = "hidden"
      }
      if (e.key === "Escape") {
        setIsShow(false)
        setSearch("")
        document.body.style.overflow = "auto"
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const copyWord = (word: string) => {
    navigator.clipboard.writeText(word)
      .then(() => message.success("复制成功"))
      .catch(() => message.error("复制失败"))
  }

  if (!isShow) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 blur-sm" onClick={() => setIsShow(false)} />
      <div className="fixed inset-0 z-50 p-30 pt-20">
        <div
          className={`flex items-center gap-2 shadow-lg w-1/2 mx-auto p-3 bg-white ${wordList.length > 0 ? "rounded-t-xl" : "rounded-xl"}`}
        >
          <SearchOutlined className="text-lg text-gray-400" />
          <Input
            autoFocus
            placeholder="搜索"
            variant="borderless"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {wordList.length > 0 && (
          <div className="w-1/2 mx-auto max-h-[500px] border-t border-gray-200 overflow-y-auto">
            {wordList.map((item) => (
              <div
                key={item.id}
                onClick={() => copyWord(item.word)}
                className="bg-white hover:bg-blue-50 text-gray-800 p-4 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="text-sm font-semibold text-blue-600 mb-1">{item.word}</div>
                <div
                  className="text-sm text-gray-700 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: item.translation || "" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
