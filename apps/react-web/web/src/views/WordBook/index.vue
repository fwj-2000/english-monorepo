<template>
  <div class="page-container mt-10 rounded-2xl p-10 bg-surface border border-border">
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-1">
        <el-icon :size="22" color="var(--color-primary-600)"><Reading /></el-icon>
        <span class="text-2xl font-bold text-text-primary">词库列表</span>
      </div>
      <p class="text-sm text-text-tertiary">
        词典来源：牛津、柯林斯、BNC、FRQ、高考、中考、GRE、TOEFL、IELTS、大学英语六级、大学英语四级、考研
      </p>
    </div>
    <div class="flex items-center flex-wrap gap-2 mb-8">
      <el-input
        @keyup.enter="searchWord"
        class="w-48!"
        v-model="query.word"
        placeholder="请输入单词"
      />
      <el-checkbox v-model="query.gk">高考</el-checkbox>
      <el-checkbox v-model="query.zk">中考</el-checkbox>
      <el-checkbox v-model="query.gre">GRE</el-checkbox>
      <el-checkbox v-model="query.toefl">TOEFL</el-checkbox>
      <el-checkbox v-model="query.ielts">IELTS</el-checkbox>
      <el-checkbox v-model="query.cet6">六级</el-checkbox>
      <el-checkbox v-model="query.cet4">四级</el-checkbox>
      <el-checkbox v-model="query.ky">考研</el-checkbox>
      <el-button @click="searchWord" class="ml-2" type="primary">搜索</el-button>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="card card-hover p-4 cursor-pointer" v-for="item in list" :key="item.id">
        <div class="">
          <div class="text-sm font-semibold text-primary-600 mb-1">
            {{ item.word }}
          </div>
          <div class="text-sm text-text-tertiary mb-1 flex items-center gap-2">
            {{ item.phonetic }}
            <el-icon
              @click="playAudio(item.word)"
              :size="18"
              class="cursor-pointer hover:text-primary-500 transition-colors"
              ><VideoPlay
            /></el-icon>
          </div>
          <div class="text-sm text-text-secondary mb-1 overflow-hidden line-clamp-2">
            {{ item.definition }}
          </div>
          <div
            v-html="item.translation"
            class="text-sm text-text-tertiary mb-1 overflow-hidden line-clamp-2"
          ></div>
          <div class="text-sm text-text-secondary mt-3 flex items-center gap-2 flex-wrap">
            <el-tag v-if="item.gk" type="primary" size="small">高考</el-tag>
            <el-tag v-if="item.zk" type="primary" size="small">中考</el-tag>
            <el-tag v-if="item.gre" type="primary" size="small">GRE</el-tag>
            <el-tag v-if="item.toefl" type="primary" size="small">TOEFL</el-tag>
            <el-tag v-if="item.ielts" type="primary" size="small">IELTS</el-tag>
            <el-tag v-if="item.cet6" type="primary" size="small">六级</el-tag>
            <el-tag v-if="item.cet4" type="primary" size="small">四级</el-tag>
            <el-tag v-if="item.ky" type="primary" size="small">考研</el-tag>
          </div>
        </div>
      </div>
      <el-pagination
        class="mt-10"
        background
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        @current-change="getList"
        @size-change="getList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getWordBookList } from '@/apis/word-book'
  import type { WordQuery, WordList } from '@en/common/word'
  import { Reading, VideoPlay } from '@element-plus/icons-vue'
  import { useAudio } from '@/hooks/useAudio'
  const { playAudio } = useAudio({})
  const total = ref<WordList['total']>(0)
  const list = ref<WordList['list']>([])

  const query = ref<WordQuery>({
    page: 1,
    pageSize: 12,
    word: '',
    gk: false,
    zk: false,
    gre: false,
    toefl: false,
    ielts: false,
    cet6: false,
    cet4: false,
    ky: false,
  })
  const searchWord = () => {
    query.value.page = 1 //重置一下页数
    getList() //重新获取列表
  }

  const getList = async () => {
    const res = await getWordBookList(query.value)
    if (res.success) {
      total.value = res.data.total
      list.value = res.data.list
    }
  }

  onMounted(() => {
    getList()
  })
</script>
