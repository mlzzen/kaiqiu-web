<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card>
        <template #header>
          <div class="header">排行榜入口</div>
        </template>
        <el-menu :default-active="activeTid" @select="selectTid">
          <el-menu-item v-for="item in topList" :key="String(item.tid)" :index="String(item.tid)">
            {{ item.name }}
          </el-menu-item>
        </el-menu>
      </el-card>
    </el-col>
    <el-col :span="16">
      <el-card>
        <template #header>
          <div class="header">Top100 详情</div>
        </template>
        <el-table :data="tableRows" stripe v-loading="loading">
          <el-table-column label="排名" type="index" width="70" />
          <el-table-column label="昵称" min-width="180">
            <template #default="scope">
              <el-button v-if="scope.row.uid || scope.row.id" link type="primary" @click="goUser(scope.row.uid || scope.row.id)">{{ scope.row.username }}</el-button>
              <span v-else>{{ scope.row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="realname" label="真实姓名" min-width="130" />
          <el-table-column prop="score" label="积分" width="100" />
          <el-table-column prop="city" label="城市" width="120" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getTop100Data, getTopView } from '../api/top'
import { useUserStore } from '../stores/user'
import { toList } from '../utils/format'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const topList = ref([])
const tableRows = ref([])
const activeTid = ref('')

async function loadTopView() {
  const res = await getTopView(userStore.city.name)
  topList.value = (res.data?.data || []).filter((v) => ![11, 10, 6].includes(Number(v.tid)))
  if (topList.value.length) {
    activeTid.value = String(topList.value[0].tid)
    await loadTop100(activeTid.value)
  }
}

async function loadTop100(tid) {
  loading.value = true
  try {
    const res = await getTop100Data({ city: userStore.city.name, tabIndex: 1, tid })
    tableRows.value = toList(res.data)
  } finally {
    loading.value = false
  }
}

function selectTid(tid) {
  activeTid.value = tid
  loadTop100(tid)
}

loadTopView()

function goUser(uid) {
  if (!uid) {
    return
  }
  router.push(`/user/${uid}`)
}
</script>

<style scoped>
.header {
  font-weight: 700;
  color: #2f4d32;
}
</style>
