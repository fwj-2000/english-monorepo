import { useEffect } from "react"
import { useNavigate } from "react-router"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ReadOutlined, MessageOutlined, SoundOutlined,
  DashboardOutlined, CommentOutlined, BarChartOutlined,
} from "@ant-design/icons"
import Hologram from "./components/Hologram"
import { useLogin } from "@/hooks/useLogin"

gsap.registerPlugin(ScrollTrigger)

export function Home() {
  const navigate = useNavigate()
  const { login } = useLogin()

  useEffect(() => {
    const cards = gsap.utils.toArray(".about-card") as HTMLElement[]
    cards.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.4,
          delay: index * 0.08, ease: "power2.out",
          scrollTrigger: { trigger: ".cards-container", start: "top 80%" },
        }
      )
    })
  }, [])

  const steps = [
    { icon: <ReadOutlined />, title: "学单词", desc: "浏览精选词库，看释义、听发音、看例句，建立初步印象。" },
    { icon: <CommentOutlined />, title: "AI 对话练习", desc: "与 AI 进行英文对话，在真实语境中使用刚学的单词，巩固记忆。" },
    { icon: <MessageOutlined />, title: "每日复习报告", desc: "每天收到 AI 生成的复习邮件，汇总学习进度，温故知新。" },
  ]

  const features = [
    {
      icon: <CommentOutlined />, title: "AI 情景对话",
      content: "沉浸式场景模拟，在真实语境中自然习得英语。",
      points: ["多角色 AI 对话", "实时语法纠错", "支持深度思考模式"],
    },
    {
      icon: <BarChartOutlined />, title: "科学词汇记忆",
      content: "基于艾宾浩斯遗忘曲线，智能安排复习计划。",
      points: ["拼写练习检测掌握度", "智能间隔重复", "可视化学习进度"],
    },
    {
      icon: <SoundOutlined />, title: "听说读写全覆盖",
      content: "从单词发音到完整对话，全方位提升英语能力。",
      points: ["标准英音/美音发音", "单词拼写强化", "阅读理解练习"],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Hero */}
      <section className="relative mt-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between px-12 py-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white/80 bg-white/15 rounded-full mb-6">
              <DashboardOutlined /> 词汇量提升 300% · 每天只需 15 分钟
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight">
              用 AI 读懂英语，<br />而不是死记硬背
            </h1>
            <p className="mt-4 text-base text-white/65 leading-relaxed max-w-md">
              覆盖高考、考研、四六级、托福雅思词库。AI 对话练习 + 科学记忆法，让每个单词真正属于你。
            </p>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => login()}
                className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer shadow-sm"
              >
                免费开始学习
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
              >
                浏览课程
              </button>
            </div>
          </div>
          <div className="relative shrink-0">
            <Hologram />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-20">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-3">
            每天只需 3 步
          </span>
          <h2 className="text-3xl font-bold text-gray-800">像母语者一样学习英语</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative bg-white rounded-xl border border-gray-200 p-6 text-center">
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <div className="w-14 h-14 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-2xl text-blue-600">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">不只是背单词</h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            我们的 AI 技术让英语学习从"被动记忆"变成"主动掌握"
          </p>
        </div>
        <div className="grid cards-container grid-cols-3 gap-6">
          {features.map((item) => (
            <div key={item.title} className="about-card bg-white rounded-xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 text-2xl text-blue-600">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.content}</p>
              <ul className="mt-4 space-y-1.5">
                {item.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="mt-0.5 text-green-500">✓</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Tags */}
      <section className="mt-20 bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">覆盖主流考试词库</h2>
        <p className="text-gray-500 text-sm mb-8">无论你准备什么考试，我们都有对应的词库</p>
        <div className="flex flex-wrap justify-center gap-3">
          {["高考", "中考", "考研", "四级 CET-4", "六级 CET-6", "托福 TOEFL", "雅思 IELTS", "GRE"].map((tag) => (
            <span key={tag} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{tag}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
