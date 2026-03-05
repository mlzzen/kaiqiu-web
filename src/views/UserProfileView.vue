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

        <template v-if="scoreTrend.length">
          <div class="section-title">最近40场比赛积分趋势</div>
          <div class="trend-wrap">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" class="trend-svg">
              <line :x1="chartBox.left" :y1="chartBox.top" :x2="chartBox.left" :y2="chartBox.bottom" stroke="#9ca3af" stroke-width="1.5" />
              <line :x1="chartBox.left" :y1="chartBox.bottom" :x2="chartBox.right" :y2="chartBox.bottom" stroke="#9ca3af" stroke-width="1.5" />
              <g v-for="tick in yTicks" :key="`y-${tick.value}`">
                <line :x1="chartBox.left - 6" :y1="tick.y" :x2="chartBox.right" :y2="tick.y" stroke="#e5e7eb" stroke-width="1" />
                <text :x="chartBox.left - 10" :y="tick.y + 4" text-anchor="end" font-size="16" fill="#6b7280">{{ tick.label }}</text>
              </g>
              <g v-for="tick in xTicks" :key="`x-${tick.index}`">
                <line :x1="tick.x" :y1="chartBox.bottom" :x2="tick.x" :y2="chartBox.bottom + 5" stroke="#9ca3af" stroke-width="1" />
                <text :x="tick.x" :y="chartBox.bottom + 22" text-anchor="middle" font-size="14" fill="#6b7280">{{ tick.label }}</text>
              </g>
              <polyline
                fill="none"
                stroke="#248dff"
                stroke-width="3"
                :points="trendPoints"
              />
              <g v-for="point in trendDots" :key="point.index">
                <circle :cx="point.x" :cy="point.y" r="3.5" fill="#248dff" />
              </g>
            </svg>
          </div>
        </template>

        <template v-if="showTags.length">
          <div class="section-title">收到最多评价</div>
          <div class="tag-list">
            <el-tag
              v-for="tag in showTags"
              :key="`${tag.ename}-${tag.etype}`"
              :type="tag.selected == 1 ? 'success' : 'info'"
              effect="plain"
              class="tag-item"
            >
              {{ tag.ename }} ({{ tag.count }})
            </el-tag>
          </div>
        </template>

        <div class="section-title">基础信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="性别年龄">
            {{ profile.sex || '-' }}{{ profile.age ? ` ${profile.age}岁` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="所在">{{ profile.resideprovince || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业背景">{{ profile.bg || '-' }}</el-descriptions-item>
          <el-descriptions-item label="底板型号">{{ `${profile.qiupai || ''} ${profile.qiupaitype || ''}`.trim() || '-' }}</el-descriptions-item>
          <el-descriptions-item label="正手套胶">{{ `${profile.zhengshou || ''} ${profile.zhengshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
          <el-descriptions-item label="反手套胶">{{ `${profile.fanshou || ''} ${profile.fanshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
        </el-descriptions>

        <template v-if="top3BeatList.length">
          <div class="section-title">击败分数最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatList" :key="`top3-beat-${index}`">
              <el-button link type="primary" class="clickable-text" @click="goTopListUser('Top3OfBeat', index)">{{ item }}</el-button>
            </div>
          </div>
        </template>

        <template v-if="top3PlayerList.length">
          <div class="section-title">交手分数最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3PlayerList" :key="`top3-player-${index}`">
              <el-button link type="primary" class="clickable-text" @click="goTopListUser('TopPlayer', index)">{{ item }}</el-button>
            </div>
          </div>
        </template>

        <template v-if="top3BeatManList.length">
          <div class="section-title">击败男子最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatManList" :key="`top3-man-${index}`">
              <el-button link type="primary" class="clickable-text" @click="goTopListUser('Top3ManOfBeat', index)">{{ item }}</el-button>
            </div>
          </div>
        </template>

        <template v-if="top3BeatWomanList.length">
          <div class="section-title">击败女子最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatWomanList" :key="`top3-woman-${index}`">
              <el-button link type="primary" class="clickable-text" @click="goTopListUser('Top3WomanOfBeat', index)">{{ item }}</el-button>
            </div>
          </div>
        </template>

        <template v-if="kuZhuList.length">
          <div class="section-title">苦主</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in kuZhuList" :key="`kuzhu-${index}`">
              <el-button v-if="item.uid" link type="primary" class="clickable-text" @click="goUser(item.uid)">{{ item.name }}({{ item.score || '-' }})</el-button>
              <span v-else>{{ item.name }}({{ item.score || '-' }})</span>
              <span class="sub">{{ item.detail }}</span>
            </div>
          </div>
        </template>

        <template v-if="fuXingList.length">
          <div class="section-title">福星</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in fuXingList" :key="`fuxing-${index}`">
              <el-button v-if="item.uid" link type="primary" class="clickable-text" @click="goUser(item.uid)">{{ item.name }}({{ item.score || '-' }})</el-button>
              <span v-else>{{ item.name }}({{ item.score || '-' }})</span>
              <span class="sub">{{ item.detail }}</span>
            </div>
          </div>
        </template>

        <template v-if="oftenPlayerList.length">
          <div class="section-title">经常交手</div>
          <div class="tag-list">
            <el-tag v-for="(item, index) in oftenPlayerList" :key="`often-${index}`" effect="plain">{{ item }}</el-tag>
          </div>
        </template>

        <template v-if="allCitiesList.length">
          <div class="section-title">曾参加比赛城市</div>
          <div class="tag-list">
            <el-tag v-for="(city, index) in allCitiesList" :key="`city-${index}`" type="info" effect="plain">{{ city }}</el-tag>
          </div>
        </template>

        <template v-if="profile.honors?.length">
          <div class="section-title">近期荣耀</div>
          <div class="honor-list">
            <div class="honor-item" v-for="(item, index) in profile.honors" :key="index">
              <img class="honor-icon" :src="item.honor" alt="honor" />
              <span>{{ item.subject }}</span>
            </div>
          </div>
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
import { getAdvProfile, getPageGamesByUid, getUserScores, getUserTags, goCancelFolloweeByUid, goFolloweeByUid } from '../api/user'
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
const showTags = ref([])
const scoreTrend = ref([])

const uid = computed(() => route.params.uid || userStore.userInfo?.user_id || userStore.userInfo?.id)
const showFollowButton = computed(() => Number(profile.value.hasFollowed) !== -1)
const safeDescription = computed(() => {
  try {
    return decodeURIComponent(profile.value.description || '')
  } catch {
    return profile.value.description || ''
  }
})
const oftenPlayerList = computed(() => splitValue(profile.value.OftenPlayer))
const top3BeatList = computed(() => splitValue(profile.value.Top3OfBeatUsernameScore))
const top3PlayerList = computed(() => splitValue(profile.value.TopPlayerUsernameScore))
const top3BeatManList = computed(() => splitValue(profile.value.Top3ManOfBeatUsernameScore))
const top3BeatWomanList = computed(() => splitValue(profile.value.Top3WomanOfBeatUsernameScore))
const allCitiesList = computed(() => splitValue(profile.value.allCities))
const kuZhuList = computed(() => parseSpecialRival(profile.value.kuzhu))
const fuXingList = computed(() => parseSpecialRival(profile.value.fuxing))

const trendPoints = computed(() => {
  if (scoreTrend.value.length <= 1) {
    return ''
  }
  return trendDots.value.map((p) => `${p.x},${p.y}`).join(' ')
})

const chartBox = {
  left: 80,
  right: 970,
  top: 18,
  bottom: 250
}

const scoreRange = computed(() => {
  const values = scoreTrend.value.map((v) => Number(v.postscore || 0))
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  return { min, max, range }
})

const trendDots = computed(() => {
  if (!scoreTrend.value.length) {
    return []
  }
  const { min, range } = scoreRange.value
  const width = chartBox.right - chartBox.left
  const height = chartBox.bottom - chartBox.top
  return scoreTrend.value
    .map((item, index) => {
      const ratio = scoreTrend.value.length === 1 ? 0 : index / (scoreTrend.value.length - 1)
      const x = chartBox.left + ratio * width
      const y = chartBox.bottom - ((Number(item.postscore || 0) - min) / range) * height
      return { index, x, y, date: item.dateline }
    })
})

const yTicks = computed(() => {
  if (!scoreTrend.value.length) {
    return []
  }
  const count = 4
  const { min, max } = scoreRange.value
  const step = (max - min) / count
  return Array.from({ length: count + 1 }).map((_, i) => {
    const value = max - step * i
    const y = chartBox.top + ((chartBox.bottom - chartBox.top) * i) / count
    return { value, y, label: Math.round(value) }
  })
})

const xTicks = computed(() => {
  if (!trendDots.value.length) {
    return []
  }
  const indexes = Array.from(new Set([
    0,
    Math.floor((trendDots.value.length - 1) * 0.33),
    Math.floor((trendDots.value.length - 1) * 0.66),
    trendDots.value.length - 1
  ])).filter((i) => i >= 0)
  return indexes.map((i) => {
    const dot = trendDots.value[i]
    const raw = dot.date || ''
    const label = raw.length >= 10 ? raw.slice(5, 10) : raw
    return { index: i, x: dot.x, label }
  })
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
  await Promise.all([
    loadUserTags(),
    loadUserScores()
  ])
  await loadGames(1)
}

async function loadUserTags() {
  if (!uid.value) {
    return
  }
  const res = await getUserTags({ uid: uid.value, limitByCount: 6, getNegative: false })
  showTags.value = (res.data || []).filter((v) => Number(v.count || 0) > 0)
}

async function loadUserScores() {
  if (!uid.value) {
    return
  }
  const res = await getUserScores(uid.value)
  scoreTrend.value = (res.data || []).slice(-40)
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

function splitValue(raw, delimiter = ',') {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || '').trim()).filter(Boolean)
  }
  return String(raw || '')
    .split(delimiter)
    .map((v) => v.trim())
    .filter(Boolean)
}

function parseSpecialRival(raw) {
  return String(raw || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item.split(',')
      return {
        name: parts[1] || '',
        score: parts[2] || '',
        uid: parts[3] || '',
        detail: parts[5] || ''
      }
    })
    .filter((item) => item.name)
}

function goTopListUser(type, index) {
  const ids = splitValue(profile.value[type])
  const target = ids[2 - index]
  if (target) {
    goUser(target)
  }
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

.trend-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  padding: 10px;
}

.trend-svg {
  width: 100%;
  height: 280px;
  display: block;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.honor-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.honor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.honor-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
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

.stat-list {
  display: grid;
  gap: 8px;
}

.stat-item {
  display: flex;
  gap: 8px;
  color: #374151;
}

.clickable-text {
  cursor: pointer;
}
</style>
