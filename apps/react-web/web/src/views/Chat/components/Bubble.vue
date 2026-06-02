<template>
  <div class="flex-1 flex flex-col min-h-0 bg-surface">
    <!-- 消息列表 -->
    <div class="flex-1 overflow-y-auto px-6 py-4" ref="scrollContainer">
      <!-- 空状态 -->
      <div
        v-if="!list?.length"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
          <el-icon :size="32" color="var(--color-primary-500)"><ChatDotRound /></el-icon>
        </div>
        <h3 class="text-base font-semibold text-text-primary mb-1">开始你的英语学习之旅</h3>
        <p class="text-sm text-text-tertiary max-w-xs">
          选择左侧对话模式，然后用英语或中文与 AI 交流
        </p>
      </div>

      <!-- 消息 -->
      <template v-else>
        <div v-for="(item, index) in list" :key="index" class="mb-6">
          <!-- 用户消息 -->
          <div v-if="item.role === 'human'" class="flex justify-end gap-3">
            <div
              class="max-w-[75%] bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-sm"
            >
              {{ item.content }}
            </div>
            <div
              class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0"
            >
              <el-icon :size="18" color="var(--color-primary-600)"><User /></el-icon>
            </div>
          </div>

          <!-- AI 消息 -->
          <div v-else class="flex gap-3">
            <div
              class="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center shrink-0"
            >
              <el-icon :size="18" color="white"><Cpu /></el-icon>
            </div>
            <div class="max-w-[75%] min-w-0">
              <!-- 深度思考折叠区 -->
              <details v-if="item.reasoning" class="mb-2 group" :open="false">
                <summary
                  class="flex items-center gap-1.5 text-xs text-text-tertiary cursor-pointer hover:text-text-secondary transition-colors select-none"
                >
                  <el-icon :size="14"><DataBoard /></el-icon>
                  <span>深度思考</span>
                  <el-icon :size="12" class="transition-transform group-open:rotate-90"
                    ><ArrowRight
                  /></el-icon>
                </summary>
                <div
                  class="mt-2 px-3 py-2 bg-primary-50/50 rounded-lg text-xs text-text-secondary leading-relaxed border border-primary-100/50 whitespace-pre-wrap"
                >
                  {{ item.reasoning }}
                </div>
              </details>

              <!-- AI 回复 -->
              <div
                v-if="item.content !== ''"
                class="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-text-primary leading-relaxed shadow-sm border border-border deepseek-markdown"
                v-html="parseMarkdown(item.content)"
              />

              <!-- 流式生成中的省略号 -->
              <div
                v-if="item.role === 'ai' && item.content === '' && !item.reasoning"
                class="bg-white rounded-2xl rounded-bl-md px-4 py-3 text-sm text-text-tertiary shadow-sm border border-border inline-flex items-center gap-1"
              >
                <span
                  class="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                ></span>
                <span
                  class="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                ></span>
                <span
                  class="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div ref="chatRef"></div>
    </div>

    <!-- 输入区 -->
    <div class="border-t border-border bg-white px-5 py-4">
      <!-- 功能开关 -->
      <div class="flex items-center gap-2 mb-3">
        <button
          @click="deepThink = !deepThink"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border',
            deepThink
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-white border-border text-text-tertiary hover:bg-surface',
          ]"
        >
          <el-icon :size="14"><DataBoard /></el-icon>
          深度思考
        </button>
        <button
          @click="webSearch = !webSearch"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border',
            webSearch
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-white border-border text-text-tertiary hover:bg-surface',
          ]"
        >
          <el-icon :size="14"><Connection /></el-icon>
          联网搜索
        </button>
      </div>

      <!-- 输入框 + 按钮 -->
      <div class="flex items-end gap-2">
        <el-input
          @keyup.enter="sendMessage"
          type="textarea"
          :rows="2"
          v-model="message"
          placeholder="用英语或中文开始对话..."
          class="flex-1"
        />
        <button
          @click="sendMessage"
          :disabled="!message.trim()"
          class="btn-primary w-10 h-10 p-0! rounded-xl! shrink-0"
          aria-label="发送消息"
        >
          <el-icon :size="18"><Promotion /></el-icon>
        </button>
        <button
          v-if="!isRecording"
          @click="startRecording"
          class="btn-ghost w-10 h-10 p-0! rounded-xl! shrink-0 border border-border"
          aria-label="语音输入"
        >
          <el-icon :size="18"><Microphone /></el-icon>
        </button>
        <button
          v-else
          @click="stopRecording"
          class="btn-danger w-10 h-10 p-0! rounded-xl! shrink-0 border border-red-200"
          aria-label="停止录音"
        >
          <el-icon :size="18"><VideoPause /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, useTemplateRef, watch, nextTick } from 'vue'
  import {
    Promotion,
    Microphone,
    VideoPause,
    ChatDotRound,
    User,
    Cpu,
    DataBoard,
    Connection,
    ArrowRight,
  } from '@element-plus/icons-vue'
  import type { ChatMessageList } from '@en/common/chat'
  import { marked } from 'marked'
  import '@/assets/css/deep-seek.css'
  import { useVoiceToText } from '@/hooks/useVoiceToText'

  const { isRecording, start, stop } = useVoiceToText({
    lang: 'zh-CN',
    continuous: true,
  })

  const deepThink = ref(false)
  const webSearch = ref(false)
  const emits = defineEmits(['onSendMessage'])
  const chatRef = useTemplateRef<HTMLDivElement>('chatRef')
  const props = defineProps<{
    list?: ChatMessageList
  }>()
  const message = ref<string>('')

  const sendMessage = () => {
    if (!message.value.trim()) return
    emits('onSendMessage', message.value, deepThink.value, webSearch.value)
    message.value = ''
  }

  const parseMarkdown = (content: string) => {
    if (!content) return ''
    return marked.parse(content)
  }

  const startRecording = () => {
    start(result => {
      message.value = result
    })
  }

  const stopRecording = () => {
    stop()
    sendMessage()
  }

  watch(
    () => props.list,
    () => {
      nextTick(() => {
        chatRef.value?.scrollIntoView({ behavior: 'smooth' })
      })
    },
    { immediate: true, deep: true }
  )
</script>
