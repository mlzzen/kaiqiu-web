<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card>
        <div class="profile">
          <el-avatar :size="90" :src="profile.realpic || profile.image" />
          <div class="name">{{ profile.realname || '-' }}</div>
          <div class="sub">{{ profile.username || '-' }}</div>
          <div class="meta">{{ profile.scope || '全国' }}排名: {{ profile.rank ?? '-' }}</div>
          <el-button type="success" plain @click="toggleFollow" v-if="showFollowButton">
            {{ Number(profile.hasFollowed) === 1 ? '取消关注' : '关注Ta' }}
          </el-button>
        </div>
      </el-card>
    </el-col>

    <el-col :span="16">
      <el-card>
        <template #header>
          <div class="header">积分信息</div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="当前积分">{{ profile.score ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="年度积分">{{ profile.maxScoreTheYear ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="最高积分">{{ profile.maxscore ?? '-' }}</el-descriptions-item>
        </el-descriptions>

        <template v-if="profile.description">
          <div class="section-title">比赛信息</div>
          <div class="html" v-html="safeDescription"></div>
        </template>

        <div class="section-title">近期战绩</div>
        <el-table :data="games" stripe v-loading="gamesLoading">
          <el-table-column label="日期" width="130">
            <template #default="scope">
              <el-button
                v-if="getEventId(scope.row)"
                link
                type="primary"
                @click="goEvent(scope.row)"
              >
                {{ scope.row.dateline }}
              </el-button>
              <span v-else>{{ scope.row.dateline }}</span>
            </template>
          </el-table-column>
          <el-table-column label="选手1" min-width="140">
            <template #default="scope">
              <el-button v-if="scope.row.uid1" link type="primary" @click="goUser(scope.row.uid1)">{{ scope.row.username1 }}</el-button>
              <span v-else>{{ scope.row.username1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="选手2" min-width="140">
            <template #default="scope">
              <el-button v-if="scope.row.uid2" link type="primary" @click="goUser(scope.row.uid2)">{{ scope.row.username2 }}</el-button>
              <span v-else>{{ scope.row.username2 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="比分" min-width="90">
            <template #default="scope">{{ scope.row.result1 }}:{{ scope.row.result2 }}</template>
          </el-table-column>
          <el-table-column label="赛事" prop="title" min-width="220" />
        </el-table>
        <div class="pager">
          <el-button :disabled="page <= 1 || gamesLoading" @click="prevPage">上一页</el-button>
          <span class="page-text">第 {{ page }} 页</span>
          <el-button :disabled="!hasNext || gamesLoading" @click="nextPage">下一页</el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getAdvProfile, getPageGamesByUid, goCancelFolloweeByUid, goFolloweeByUid } from '../api/user'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const profile = ref({})
const games = ref([])
const gamesLoading = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)
const firstPageGames = ref([])
const hasNext = ref(false)
const effectivePageSize = ref(20)

const uid = computed(() => route.params.uid || userStore.userInfo?.user_id || userStore.userInfo?.id)
const showFollowButton = computed(() => Number(profile.value.hasFollowed) !== -1)
const safeDescription = computed(() => {
  try {
    return decodeURIComponent(profile.value.description || '')
  } catch {
    return profile.value.description || ''
  }
})

async function loadData() {
  if (!uid.value) {
    return
  }
  const res = await getAdvProfile(uid.value)
  profile.value = res.data || {}
  firstPageGames.value = res.data?.games?.data || []
  effectivePageSize.value = firstPageGames.value.length > 0 ? firstPageGames.value.length : pageSize
  total.value = Number(
    res.data?.games?.total ||
    res.data?.games?.count ||
    res.data?.games?.recordsTotal ||
    0
  )
  // 原版是无限加载：未知总数时先允许继续翻页，直到某页返回空/不足再收口
  hasNext.value = total.value > 0 ? effectivePageSize.value < total.value : firstPageGames.value.length > 0
  await loadGames(1)
}

async function loadGames(nextPage = 1) {
  if (!uid.value) {
    return
  }
  page.value = nextPage
  gamesLoading.value = true
  try {
    if (nextPage === 1) {
      games.value = firstPageGames.value
      hasNext.value = total.value > 0 ? effectivePageSize.value < total.value : firstPageGames.value.length > 0
      return
    }
    const res = await getPageGamesByUid(uid.value, nextPage)
    const rows = res.data?.data || []
    games.value = rows
    const remoteTotal = Number(res.data?.total || res.data?.count || 0)
    if (remoteTotal > 0) {
      total.value = remoteTotal
      hasNext.value = nextPage * effectivePageSize.value < remoteTotal
    } else if (rows.length < effectivePageSize.value) {
      total.value = Math.max(total.value, (nextPage - 1) * effectivePageSize.value + rows.length)
      hasNext.value = false
    } else {
      // 后端未返回总数时，按“可能还有下一页”维持可翻页
      total.value = Math.max(total.value, nextPage * effectivePageSize.value + 1)
      hasNext.value = true
    }
  } finally {
    gamesLoading.value = false
  }
}

async function toggleFollow() {
  if (Number(profile.value.hasFollowed) === 1) {
    try {
      await ElMessageBox.confirm('确认取消关注？', '提示', { type: 'warning' })
    } catch {
      return
    }
    await goCancelFolloweeByUid(profile.value.uid)
    profile.value.hasFollowed = 0
    return
  }
  await goFolloweeByUid(profile.value.uid)
  profile.value.hasFollowed = 1
}

watch(uid, () => loadData(), { immediate: true })

function goUser(playerUid) {
  if (!playerUid) {
    return
  }
  router.push(`/user/${playerUid}`)
}

function getEventId(row) {
  return row?.eventid || row?.match_id || row?.id || null
}

function goEvent(row) {
  const eventId = getEventId(row)
  if (!eventId) {
    return
  }
  router.push(`/event/${eventId}`)
}

function prevPage() {
  if (page.value <= 1) {
    return
  }
  loadGames(page.value - 1)
}

function nextPage() {
  if (!hasNext.value) {
    return
  }
  loadGames(page.value + 1)
}
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.name {
  font-size: 20px;
  font-weight: 700;
}

.sub,
.meta {
  color: #6b7280;
}

.header {
  font-weight: 700;
}

.section-title {
  margin: 16px 0 10px;
  font-weight: 700;
}

.html {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #374151;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-text {
  min-width: 72px;
  text-align: center;
  color: #6b7280;
}
</style>
