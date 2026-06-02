<template>
  <div class="page-container pb-20">
    <!-- ═══════ Hero ═══════ -->
    <section
      class="relative mt-10 rounded-3xl bg-linear-to-br from-primary-700 via-primary-600 to-primary-500 overflow-hidden"
    >
      <div class="relative z-10 flex items-center justify-between px-12 py-16">
        <div class="max-w-xl">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white/80 bg-white/15 rounded-full mb-6"
          >
            <el-icon :size="14"><TrendCharts /></el-icon>
            词汇量提升 300% · 每天只需 15 分钟
          </span>
          <h1 class="text-4xl font-bold text-white leading-tight">
            用 AI 读懂英语，<br />而不是死记硬背
          </h1>
          <p class="mt-4 text-base text-white/65 leading-relaxed max-w-md">
            覆盖高考、考研、四六级、托福雅思词库。AI 对话练习 + 科学记忆法，让每个单词真正属于你。
          </p>
          <div class="flex items-center gap-3 mt-8">
            <button
              @click="showLogin"
              class="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors cursor-pointer shadow-sm"
            >
              免费开始学习
            </button>
            <button
              @click="goCourses"
              class="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
            >
              浏览课程
            </button>
          </div>
        </div>
        <div class="relative shrink-0">
          <Hologram />
        </div>
      </div>
    </section>

    <!-- ═══════ 学习路径 ═══════ -->
    <section class="mt-20">
      <div class="text-center mb-12">
        <span
          class="inline-block text-sm font-medium text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full mb-3"
        >
          每天只需 3 步
        </span>
        <h2 class="text-3xl font-bold text-text-primary">像母语者一样学习英语</h2>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="(step, i) in steps" :key="step.title" class="relative card p-6 text-center">
          <span
            class="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
          >
            {{ i + 1 }}
          </span>
          <div
            class="w-14 h-14 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center mb-4"
          >
            <el-icon :size="24" color="var(--color-primary-600)"
              ><component :is="step.icon"
            /></el-icon>
          </div>
          <h3 class="text-base font-semibold text-text-primary mb-2">{{ step.title }}</h3>
          <p class="text-sm text-text-secondary leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ═══════ 核心功能 ═══════ -->
    <section class="mt-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-text-primary">不只是背单词</h2>
        <p class="mt-3 text-text-secondary max-w-lg mx-auto">
          我们的 AI 技术让英语学习从"被动记忆"变成"主动掌握"
        </p>
      </div>
      <div class="grid cards-container grid-cols-3 gap-6">
        <div
          v-for="(item, index) in features"
          :key="item.title"
          class="about-card card card-hover p-8 cursor-default"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-5">
            <el-icon :size="26" color="var(--color-primary-600)"
              ><component :is="item.icon"
            /></el-icon>
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-2">{{ item.title }}</h3>
          <p class="text-sm text-text-secondary leading-relaxed">{{ item.content }}</p>
          <ul class="mt-4 space-y-1.5">
            <li
              v-for="point in item.points"
              :key="point"
              class="flex items-start gap-2 text-xs text-text-tertiary"
            >
              <el-icon :size="14" class="mt-0.5 text-success-500 shrink-0"><CircleCheck /></el-icon>
              {{ point }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ═══════ 词库覆盖 ═══════ -->
    <section class="mt-20 card p-10 text-center">
      <h2 class="text-2xl font-bold text-text-primary mb-2">覆盖主流考试词库</h2>
      <p class="text-text-secondary text-sm mb-8">无论你准备什么考试，我们都有对应的词库</p>
      <div class="flex flex-wrap justify-center gap-3">
        <span
          v-for="tag in examTags"
          :key="tag"
          class="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
          >{{ tag }}</span
        >
      </div>
    </section>

    <!-- ═══════ CTA ═══════ -->
    <!--
    <section
      class="mt-20 text-center py-16 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800"
    >
      <h2 class="text-3xl font-bold text-white mb-3">准备好提升你的英语了吗？</h2>
      <p class="text-white/60 mb-8">加入 50 万学员，今天就开始你的 AI 英语之旅</p>
      <button
        @click="showLogin"
        class="px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-400 transition-colors cursor-pointer text-base"
      >
        免费开始
      </button>
    </section> -->
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Hologram from './components/Hologram.vue'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { onMounted } from 'vue'
  import { useLogin } from '@/hooks/useLogin'
  import {
    TrendCharts,
    Reading,
    ChatDotRound,
    Microphone,
    Message,
    DataBoard,
    CircleCheck,
  } from '@element-plus/icons-vue'

  const router = useRouter()
  const { login } = useLogin()
  gsap.registerPlugin(ScrollTrigger)

  // 3 步学习路径
  const steps = [
    {
      icon: Reading,
      title: '学单词',
      desc: '浏览精选词库，看释义、听发音、看例句，建立初步印象。',
    },
    {
      icon: ChatDotRound,
      title: 'AI 对话练习',
      desc: '与 AI 进行英文对话，在真实语境中使用刚学的单词，巩固记忆。',
    },
    {
      icon: Message,
      title: '每日复习报告',
      desc: '每天收到 AI 生成的复习邮件，汇总学习进度，温故知新。',
    },
  ]

  // 核心功能（替换 emoji 为 SVG 图标）
  const features = [
    {
      icon: ChatDotRound,
      title: 'AI 情景对话',
      content: '沉浸式场景模拟，在真实语境中自然习得英语。',
      points: ['多角色 AI 对话', '实时语法纠错', '支持深度思考模式'],
    },
    {
      icon: DataBoard,
      title: '科学词汇记忆',
      content: '基于艾宾浩斯遗忘曲线，智能安排复习计划。',
      points: ['拼写练习检测掌握度', '智能间隔重复', '可视化学习进度'],
    },
    {
      icon: Microphone,
      title: '听说读写全覆盖',
      content: '从单词发音到完整对话，全方位提升英语能力。',
      points: ['标准英音/美音发音', '单词拼写强化', '阅读理解练习'],
    },
  ]

  // 考试标签
  const examTags = [
    '高考',
    '中考',
    '考研',
    '四级 CET-4',
    '六级 CET-6',
    '托福 TOEFL',
    '雅思 IELTS',
    'GRE',
  ]

  const initProject = () => {
    const cards = gsap.utils.toArray('.about-card') as HTMLElement[]
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: index * 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.cards-container', start: 'top 80%' },
        }
      )
    })
  }

  const showLogin = () => {
    login().then(() => console.log('登录成功'))
  }

  const goCourses = () => {
    router.push('/courses/index')
  }

  onMounted(() => initProject())
</script>
