<template>
  <section class="w-80 rounded-2xl bg-white overflow-hidden" aria-label="用户资料卡">
    <!-- 头像 + 信息 -->
    <div class="flex items-center gap-3 px-4 pt-4 pb-3">
      <img
        class="w-11 h-11 rounded-full border border-border object-cover shrink-0"
        :src="avatar"
        loading="lazy"
      />
      <div class="min-w-0 flex-1">
        <div class="text-sm font-semibold text-text-primary truncate" :title="displayName">
          {{ displayName }}
        </div>
        <div v-if="bio" class="text-xs text-text-tertiary truncate mt-0.5" :title="bio">
          {{ bio }}
        </div>
        <div v-if="!isLoggedIn" class="text-xs text-text-tertiary mt-1">
          登录后可同步词库进度与打卡数据
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div v-if="isLoggedIn" class="grid grid-cols-2 gap-2 px-4 pb-3">
      <div class="rounded-xl border border-border bg-surface px-3 py-2.5">
        <div class="text-xs text-text-tertiary">单词数量</div>
        <div class="mt-1 text-lg font-bold text-text-primary">
          {{ userStore?.getUser?.wordNumber ?? 0 }}
        </div>
      </div>
      <div class="rounded-xl border border-accent-400/20 bg-accent-50 px-3 py-2.5">
        <div class="text-xs text-text-tertiary">打卡天数</div>
        <div class="mt-1 text-lg font-bold text-text-primary">
          {{ userStore?.getUser?.dayNumber ?? 0 }}
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-2 border-t border-border px-4 py-3">
      <button
        v-if="!isLoggedIn"
        class="btn-primary flex-1 h-10 text-sm cursor-pointer"
        type="button"
        @click="loginHandle"
      >
        去登录
      </button>
      <template v-else>
        <button
          class="btn-ghost flex-1 h-10 text-sm border border-border cursor-pointer"
          type="button"
          @click="gotoPath('/setting/index')"
        >
          个人资料
        </button>
        <button
          class="btn-danger flex-1 h-10 text-sm border border-red-200 cursor-pointer"
          type="button"
          @click="logoutHandle"
        >
          退出登录
        </button>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue' //引入计算属性
  import { useRouter } from 'vue-router' //引入路由
  import { useUserStore } from '@/stores/user' //引入用户信息
  import { useAvatar } from '@/hooks/useAvatar'
  import { useLogin } from '@/hooks/useLogin'
  import { ElMessageBox } from 'element-plus'

  const { login, logout } = useLogin()
  const { avatar } = useAvatar()
  const userStore = useUserStore() //初始化用户信息
  const isLoggedIn = computed(() => !!userStore.getUser) //是否登录
  const router = useRouter() //初始化路由
  const bio = computed(() => userStore.getUser?.bio ?? '') //签名
  const displayName = computed(() => userStore.getUser?.name ?? '游客') //用户名
  //跳转页面
  const gotoPath = (path: string) => {
    router.push(path)
  }
  //去登录
  const loginHandle = () => {
    login()
  }
  //退出登录
  const logoutHandle = () => {
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      logout()
    })
  }
</script>
