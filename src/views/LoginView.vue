<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="title">开球网 PC 版</div>
      <div class="sub">请输入开球网账号密码</div>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" @keyup.enter="submit" />
        </el-form-item>
        <el-button type="success" class="submit" :loading="loading" @click="submit">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login } from '../api/login'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  account: '',
  password: ''
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  loading.value = true
  try {
    const res = await login(form)
    userStore.setToken(res.data?.userinfo?.token || '')
    userStore.setUserInfo(res.data?.userinfo || {})
    ElMessage.success('登录成功')
    router.replace('/home')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(140deg, #f3fdf4 0%, #eef4f9 100%);
}

.login-card {
  width: 420px;
  border-radius: 16px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #2e4a31;
}

.sub {
  margin: 8px 0 20px;
  text-align: center;
  color: var(--text-secondary);
}

.submit {
  width: 100%;
}
</style>
