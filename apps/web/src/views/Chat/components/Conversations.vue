<template>
  <aside class="w-[260px] shrink-0 border-r border-border bg-white flex flex-col">
    <!-- 标题 -->
    <div class="px-5 pt-5 pb-3">
      <h2 class="text-sm font-semibold text-text-primary">对话模式</h2>
      <p class="text-xs text-text-tertiary mt-1">选择适合你的 AI 角色</p>
    </div>

    <!-- 模式列表 -->
    <nav class="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
      <button
        v-for="mode in chatMode"
        :key="mode.id"
        @click="changeActive(mode)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer',
          active === mode.id
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-text-secondary hover:bg-surface',
        ]"
      >
        <el-icon :size="18"><component :is="modeIcon(mode.label)" /></el-icon>
        <span class="text-sm">{{ mode.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { ChatModeList, ChatMode } from '@en/common/chat'
  import { getChatMode } from '@/apis/chat'
  import {
    ChatDotRound,
    EditPen,
    Document,
    Microphone,
    ChatLineSquare,
  } from '@element-plus/icons-vue'

  const emits = defineEmits(['onGetRole'])
  const chatMode = ref<ChatModeList>([])
  const active = ref<string | null>(null)

  // 根据模式标签匹配图标
  const modeIcon = (label: string) => {
    const map: Record<string, any> = {
      语法: EditPen,
      写作: Document,
      面试: Microphone,
      对话: ChatDotRound,
    }
    for (const key of Object.keys(map)) {
      if (label.includes(key)) return map[key]
    }
    return ChatLineSquare
  }

  const changeActive = (value: ChatMode) => {
    active.value = value.id
    emits('onGetRole', value.role)
  }

  const getChatModeList = async () => {
    const res = await getChatMode()
    chatMode.value = res.data
    active.value = res.data[0]?.id ?? null
    emits('onGetRole', res.data[0]?.role)
  }

  onMounted(() => getChatModeList())
</script>
