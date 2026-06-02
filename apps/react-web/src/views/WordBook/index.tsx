import { useState, useEffect } from "react"
import { Button, Checkbox, Input, Pagination, Tag } from "antd"
import { ReadOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { getWordBookList } from "@/apis/word-book"
import type { WordQuery, WordList } from "@en/common/word"
import { useAudio } from "@/hooks/useAudio"

export function WordBook() {
  const [list, setList] = useState<WordList["list"]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<WordQuery>({
    page: 1, pageSize: 12,
    word: "", gk: false, zk: false, gre: false,
    toefl: false, ielts: false, cet6: false, cet4: false, ky: false,
  })
  const { playAudio } = useAudio()

  const getList = async (q: WordQuery) => {
    const res = await getWordBookList(q)
    if (res.success) { setList(res.data.list); setTotal(res.data.total) }
  }

  useEffect(() => { getList(query) }, [])

  const searchWord = () => { const nq = { ...query, page: 1 }; setQuery(nq); getList(nq) }
  const toggleCheck = (key: keyof WordQuery) => setQuery((prev) => ({ ...prev, [key]: !prev[key] }))

  const tags = [{ k: "gk", l: "高考" }, { k: "zk", l: "中考" }, { k: "gre", l: "GRE" }, { k: "toefl", l: "TOEFL" }, { k: "ielts", l: "IELTS" }, { k: "cet6", l: "六级" }, { k: "cet4", l: "四级" }, { k: "ky", l: "考研" }] as const

  return (
    <div className="max-w-6xl mx-auto mt-10 rounded-2xl p-10 bg-gray-50 border border-gray-200">
      <div className="mb-6">
        <ReadOutlined className="text-xl text-blue-600" />
        <span className="text-2xl font-bold text-gray-800">词库列表</span>
      </div>
      <div className="flex items-center flex-wrap gap-2 mb-8">
        <Input className="w-48" placeholder="请输入单词" value={query.word} onChange={e => setQuery(p => ({...p, word: e.target.value}))} onPressEnter={searchWord} />
        {tags.map(({k, l}) => (<Checkbox key={k} checked={!!query[k]} onChange={() => toggleCheck(k)}>{l}</Checkbox>))}
        <Button type="primary" onClick={searchWord}>搜索</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {list.map(item => (
          <div key={item.id} className="bg-white rounded-lg border p-4 hover:shadow-md">
            <div className="text-sm font-semibold text-blue-600 mb-1">{item.word}</div>
            <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">{item.phonetic}<PlayCircleOutlined onClick={() => playAudio(item.word)} className="cursor-pointer" /></div>
            <div className="text-sm text-gray-600 mb-1 line-clamp-2">{item.definition}</div>
            <div className="text-sm text-gray-400 mb-1 line-clamp-2" dangerouslySetInnerHTML={{__html: item.translation||""}} />
            <div className="flex gap-1 flex-wrap mt-3">{tags.map(({k, l}) => (item as any)[k] && <Tag key={k} color="blue">{l}</Tag>)}</div>
          </div>
        ))}
      </div>
      {total > query.pageSize && <Pagination className="mt-10" current={query.page} pageSize={query.pageSize} total={total} onChange={(page, size) => { const nq = {...query, page, pageSize: size}; setQuery(nq); getList(nq) }} />}
    </div>
  )
}
