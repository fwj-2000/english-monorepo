<template>
  <div class="mb-8">
    <h1 class="section-title">登录 English Ease</h1>
    <p class="section-desc">继续你的英语学习之旅</p>
  </div>

  <el-form ref="formRef" :model="form" :rules="rules" class="space-y-5">
    <el-form-item prop="phone">
      <el-input
        :maxlength="11"
        v-model="form.phone"
        placeholder="请输入手机号"
        size="large"
        class="h-11"
        :prefix-icon="User"
      />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        size="large"
        class="h-11"
        :prefix-icon="Lock"
        show-password
      />
    </el-form-item>

    <el-form-item class="pt-4">
      <el-button
        type="primary"
        size="large"
        class="w-full h-11 text-base font-semibold"
        @click="handleLogin"
      >
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { ref, useTemplateRef, toRaw } from 'vue'
  import { User, Lock } from '@element-plus/icons-vue'
  import { login } from '@/apis/user' //登录的接口
  import type { UserLogin } from '@en/common/user' //登录类型
  import md5 from 'md5' //md5加密
  import type { FormInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/user'
  import { useLogin } from '@/hooks/useLogin'
  const { hide } = useLogin()
  const formRef = useTemplateRef<FormInstance>('formRef')
  const userStore = useUserStore()
  const form = ref<UserLogin>({
    phone: '',
    password: '',
  })

  const rules = {
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, message: '密码长度至少为8位', trigger: 'blur' },
    ],
  }

  const handleLogin = async () => {
    await formRef.value?.validate() //触发校验的
    const res = await login({
      ...toRaw(form.value),
      password: toRaw(md5(form.value.password)),
    })
    if (res.code === 200) {
      userStore.setUser(res.data)
      ElMessage.success('登录成功')
      hide()
    } else {
      ElMessage.error(res.message)
    }
  }
</script>
