<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card>
        <div class="profile">
          <el-avatar :size="88" :src="userInfo.image" />
          <h3>{{ userInfo.username || '未登录' }}</h3>
          <div class="meta">真实姓名: {{ userInfo.realname || '-' }}</div>
          <div class="meta">当前积分: {{ userInfo.score ?? '-' }}</div>
          <div class="meta">当前信用: {{ userInfo.credit ?? '-' }}</div>
          <div class="meta">当前金币: {{ userInfo.gold ?? '-' }}</div>
          <el-button type="success" plain @click="goSign">每日签到</el-button>
        </div>
      </el-card>
    </el-col>

    <el-col :span="16">
      <el-card>
        <div class="actions">
          <el-button type="success" @click="goMyProfile">我的积分/个人主页</el-button>
          <el-button @click="goFollowing">我的关注</el-button>
        </div>
        <template #header>
          <div class="header">参赛记录</div>
        </template>
        <el-table :data="eventRows" stripe v-loading="loading">
          <el-table-column prop="title" label="赛事名称" min-width="260" />
          <el-table-column prop="city" label="城市" width="120" />
          <el-table-column prop="starttime" label="开始时间" width="180" />
          <el-table-column prop="status" label="状态" width="110" />
        </el-table>
        <div class="pager">
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page="page"
            :page-size="10"
            :total="total"
            @current-change="loadEvents"
          />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getDaySign, getMatchListHisByPage, getUserInfo } from '../api/user'
import { toList } from '../utils/format'

const router = useRouter()
const userInfo = ref({})
const eventRows = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

async function loadUser() {
  const res = await getUserInfo()
  userInfo.value = res.data || {}
}

async function loadEvents(nextPage = 1) {
  page.value = nextPage
  loading.value = true
  try {
    const res = await getMatchListHisByPage(nextPage)
    eventRows.value = toList(res.data)
    total.value = Number(res.data?.total || eventRows.value.length)
  } finally {
    loading.value = false
  }
}

async function goSign() {
  await getDaySign()
  ElMessage.success('签到成功')
  await loadUser()
}

function goMyProfile() {
  router.push('/user')
}

function goFollowing() {
  router.push('/following')
}

Promise.all([loadUser(), loadEvents(1)])
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile h3 {
  margin: 8px 0 4px;
}

.meta {
  color: #4b5563;
  font-size: 13px;
}

.header {
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}
</style>
