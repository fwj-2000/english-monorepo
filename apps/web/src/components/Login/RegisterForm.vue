<template>
  <div class="mb-8">
    <h1 class="section-title">加入 English Ease</h1>
    <p class="section-desc">开始你的英语学习之旅</p>
  </div>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80"
    label-position="top"
    class="space-y-5"
  >
    <el-form-item prop="name">
      <el-input
        v-model="form.name"
        placeholder="请输入用户名"
        size="large"
        class="h-11"
        :prefix-icon="User"
      />
    </el-form-item>
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
    <el-form-item prop="email">
      <el-input
        v-model="form.email"
        placeholder="请输入邮箱 (选填)"
        size="large"
        class="h-11"
        :prefix-icon="User"
      />
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码 (至少8位)"
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
        @click="handleRegister"
      >
        注册
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { ref, useTemplateRef, toRaw } from 'vue'
  import { User, Lock } from '@element-plus/icons-vue'
  import { register } from '@/apis/user' //注册接口
  import type { UserRegister } from '@en/common/user' //注册类型
  import md5 from 'md5' //md5加密
  import type { FormInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/user'
  import { useLogin } from '@/hooks/useLogin'
  const { hide } = useLogin()
  const formRef = useTemplateRef<FormInstance>('formRef')
  const userStore = useUserStore()
  const form = ref<UserRegister>({
    name: '',
    phone: '',
    email: '',
    password: '',
  })

  const rules = {
    name: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 10, message: '用户名长度为2-10位', trigger: 'blur' },
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, max: 32, message: '密码长度为8-32位', trigger: 'blur' },
    ],
  }

  const handleRegister = async () => {
    await formRef.value?.validate() //触发校验的
    const res = await register({
      ...toRaw(form.value),
      password: toRaw(md5(form.value.password)), //密码加密 去掉响应式不然影响页面
    })
    if (res.code === 200) {
      userStore.setUser(res.data)
      ElMessage.success('注册成功')
      hide()
    } else {
      ElMessage.error(res.message)
    }
  }
</script>
