<template>
  <el-card>
    <template #header>
      <div class="header">我的关注</div>
    </template>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column label="头像" width="90">
        <template #default="scope">
          <el-button link class="avatar-btn" @click="goUser(scope.row.fuid)">
            <el-avatar :src="scope.row.face_url" :size="46" />
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="200">
        <template #default="scope">
          <el-button link type="primary" @click="goUser(scope.row.fuid)">
            {{ scope.row.realname }} ({{ scope.row.nickname }})
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button link type="primary" @click="goUser(scope.row.fuid)">进入主页</el-button>
          <el-button link type="success" @click="toggleMatches(scope.row)">
            {{ expandedUid === scope.row.fuid ? '收起近期赛事' : '查看近期赛事' }}
          </el-button>
          <el-button link type="danger" @click="cancelFollow(scope.row)">不再关注</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-card v-if="expandedUid" class="inner" shadow="never">
      <template #header>
        <div>近期报名赛事</div>
      </template>
      <el-empty v-if="!expandedMatches.length" description="暂无近期报名比赛" />
      <el-table v-else :data="expandedMatches" stripe>
        <el-table-column prop="title" label="赛事" min-width="320" />
        <el-table-column label="地区" min-width="180">
          <template #default="scope">{{ scope.row.province }} {{ scope.row.city }}</template>
        </el-table-column>
        <el-table-column label="详情" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="goEvent(scope.row.eventid)">进入赛事</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getFolloweeEnrolledMatch, getUserFolloweesList, goCancelFolloweeByUid } from '../api/user'

const router = useRouter()
const loading = ref(false)
const rows = ref([])
const expandedUid = ref('')
const expandedMatches = ref([])

async function loadRows() {
  loading.value = true
  try {
    const res = await getUserFolloweesList()
    rows.value = res.data?.followeesList || []
  } finally {
    loading.value = false
  }
}

function goUser(uid) {
  router.push(`/user/${uid}`)
}

function goEvent(eventId) {
  router.push(`/event/${eventId}`)
}

async function toggleMatches(row) {
  if (expandedUid.value === row.fuid) {
    expandedUid.value = ''
    expandedMatches.value = []
    return
  }
  const res = await getFolloweeEnrolledMatch(row.fuid)
  expandedUid.value = row.fuid
  expandedMatches.value = res.data?.enrolledMatchList || []
}

async function cancelFollow(row) {
  try {
    await ElMessageBox.confirm('确认要取消关注吗？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await goCancelFolloweeByUid(row.fuid)
  rows.value = rows.value.filter((v) => v.fuid !== row.fuid)
  if (expandedUid.value === row.fuid) {
    expandedUid.value = ''
    expandedMatches.value = []
  }
}

loadRows()
</script>

<style scoped>
.header {
  font-weight: 700;
}

.inner {
  margin-top: 14px;
}

.avatar-btn {
  padding: 0;
}
</style>
