import { useState, useEffect, useRef, useMemo } from "react"
import { useParams } from "react-router"
import { Button, Input, Skeleton } from "antd"
import { SoundOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { getWordList, saveWordMaster } from "@/apis/learn"
import type { Word } from "@en/common/word"
import { useAudio } from "@/hooks/useAudio"

export default function Learn() {
  const { courseId, title } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [wordList, setWordList] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isWordBlurred, setIsWordBlurred] = useState(true)
  const [inputWords, setInputWords] = useState<string[]>([])
  const { playAudio } = useAudio()

  const currentWord = useMemo(() => wordList[currentIndex] ?? null, [wordList, currentIndex])

  const loadWords = async () => {
    if (!courseId) return
    setIsLoading(true)
    const res = await getWordList(courseId)
    if (res.success) {
      setWordList(res.data)
      setInputWords(new Array(res.data.length).fill(""))
      setCurrentIndex(0)
      setIsWordBlurred(true)
    }
    setIsLoading(false)
  }

  useEffect(() => { loadWords() }, [courseId])

  const nextWord = () => {
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1)
      setIsWordBlurred(true)
      const newInputs = [...inputWords]
      newInputs[currentIndex + 1] = ""
      setInputWords(newInputs)
    }
  }

  const handleSave = async () => {
    const ids = wordList.slice(0, currentIndex + 1).map((w) => w.id)
    await saveWordMaster(ids)
  }

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} className="max-w-3xl mx-auto p-10" />

  if (wordList.length === 0) {
    return <div className="flex justify-center py-20 text-gray-400">暂无单词数据</div>
  }

  if (currentIndex >= wordList.length) {
    return (
      <div className="text-center py-16 px-6 max-w-xl mx-auto bg-white rounded-xl border border-gray-200 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">学习完成!</h2>
        <p className="text-gray-500 mb-6">你已完成了所有单词的学习</p>
        <Button type="primary" size="large" onClick={handleSave}>保存学习记录</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-400 mt-1">进度 {currentIndex + 1} / {wordList.length}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Word display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-800">
              {isWordBlurred ? "?" : currentWord?.word ?? ""}
            </span>
            {currentWord?.phonetic && (
              <span className="text-lg text-gray-400">{currentWord.phonetic}</span>
            )}
            <SoundOutlined
              className="text-xl text-blue-500 cursor-pointer hover:text-blue-600"
              onClick={() => currentWord?.word && playAudio(currentWord.word)}
            />
          </div>

          {!isWordBlurred && currentWord && (
            <div className="mt-4 space-y-2">
              {currentWord.definition && (
                <p className="text-gray-600">{currentWord.definition}</p>
              )}
              {currentWord.translation && (
                <p className="text-gray-500 text-sm" dangerouslySetInnerHTML={{ __html: currentWord.translation }} />
              )}
            </div>
          )}
        </div>

        {/* Spell input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">拼写练习</label>
          <Input
            size="large"
            placeholder="请输入单词拼写"
            value={inputWords[currentIndex] ?? ""}
            onChange={(e) => {
              const next = [...inputWords]
              next[currentIndex] = e.target.value
              setInputWords(next)
            }}
            onPressEnter={() => setIsWordBlurred(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isWordBlurred ? (
            <Button type="primary" block size="large" onClick={() => setIsWordBlurred(false)}>
              揭示答案
            </Button>
          ) : (
            <Button type="primary" block size="large" onClick={nextWord}>
              {currentIndex < wordList.length - 1 ? "下一个单词" : "完成学习"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
