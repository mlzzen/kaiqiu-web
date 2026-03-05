<template>
  <div>
    <el-card v-loading="loading">
      <template #header>
        <div class="head">
          <div class="title">{{ detail.title || '赛事详情' }}</div>
          <div class="right-actions">
            <el-select v-model="activeItemId" placeholder="选择比赛分项" style="width: 300px">
              <el-option v-for="item in subEventList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <el-button type="success" :disabled="!activeItemId" @click="openMembers">参赛名单</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="联系人">{{ detail.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item label="比赛时间">{{ detail.starttime || '-' }} 至 {{ detail.endtime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="比赛球馆">{{ detail.arena_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="比赛地点" :span="2">{{ detail.location || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="currentItem" class="item-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="项目名称">{{ currentItem.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名人数">{{ currentItem.curr_count || 0 }}/{{ allCount }}</el-descriptions-item>
          <el-descriptions-item label="比赛类型">{{ currentItem.match_type || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名限制">{{ currentItem.condition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名费">{{ currentItem.cost || 0 }} 元 {{ currentItem.postfee || '' }}</el-descriptions-item>
          <el-descriptions-item label="报名状态">{{ currentItem.is_enter ? '已报名' : '未报名' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-title">比赛信息</div>
      <div class="html" v-html="detailHtml"></div>
    </el-card>

    <el-card style="margin-top: 14px">
      <el-tabs v-model="activeTab" @tab-change="loadTabData">
        <el-tab-pane label="赛程" name="groups" />
        <el-tab-pane label="成绩" name="results" />
        <el-tab-pane label="名次" name="honors" />
        <el-tab-pane label="积分变化" name="score" />
      </el-tabs>

      <el-table v-if="activeTab === 'groups'" :data="groupRows" stripe v-loading="tabLoading">
        <el-table-column prop="groupIndex" label="分组" width="80" />
        <el-table-column label="选手" min-width="180">
          <template #default="scope">
            <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.username }}</el-button>
            <span v-else>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分" width="100" />
        <el-table-column prop="rank" label="名次" width="90" />
      </el-table>

      <el-table v-else-if="activeTab === 'results'" :data="resultRows" stripe v-loading="tabLoading">
        <el-table-column prop="groupIndex" label="分组" width="80" />
        <el-table-column label="选手" min-width="180">
          <template #default="scope">
            <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.username }}</el-button>
            <span v-else>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分" width="100" />
        <el-table-column prop="rank" label="名次" width="90" />
      </el-table>

      <el-table v-else-if="activeTab === 'honors'" :data="honorRows" stripe v-loading="tabLoading">
        <el-table-column prop="honor" label="名次" width="120" />
        <el-table-column label="选手" min-width="220">
          <template #default="scope">
            <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.name }}</el-button>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分" width="100" />
      </el-table>

      <el-table v-else :data="scoreRows" stripe v-loading="tabLoading">
        <el-table-column label="姓名" min-width="160">
          <template #default="scope">
            <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.realname }}</el-button>
            <span v-else>{{ scope.row.realname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="prescore" label="赛前积分" width="120" />
        <el-table-column prop="postscore" label="赛后积分" width="120" />
        <el-table-column label="变化" width="100">
          <template #default="scope">{{ setChange(scope.row.change) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="memberVisible" size="72%" title="参赛名单">
      <el-table :data="memberRows" stripe v-loading="memberLoading" height="100%">
        <el-table-column prop="number" label="#" width="60" />
        <el-table-column label="名称" min-width="180">
          <template #default="scope">
            <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.name }}</el-button>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="报名积分" width="120" />
        <el-table-column label="确认" width="120">
          <template #default="scope">{{ paidMap[scope.row.paid] || scope.row.paid }}</template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="scope">{{ sexMap[scope.row.sex] || '-' }}</template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllHonors, getAllResult, getEventDetaiByIdAndLocation, getGroups, getMemberDetail, getScoreChangeByEventid } from '../api/event'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const tabLoading = ref(false)
const memberLoading = ref(false)

const detail = ref({})
const subEventList = ref([])
const activeItemId = ref(null)
const activeTab = ref('groups')

const groupRows = ref([])
const resultRows = ref([])
const honorRows = ref([])
const scoreRows = ref([])

const memberVisible = ref(false)
const memberRows = ref([])

const paidMap = { 0: '交费处理中', 1: '已交付', 2: '已报名' }
const sexMap = { 1: '男', 2: '女' }

const eventId = computed(() => route.params.id)
const currentItem = computed(() => subEventList.value.find((v) => String(v.id) === String(activeItemId.value)) || null)
const allCount = computed(() => {
  if (!currentItem.value) {
    return '-'
  }
  const num = Number(currentItem.value.count || 0) - Number(currentItem.value.sub_count || 0)
  return Number.isNaN(num) ? '-' : num
})
const detailHtml = computed(() => {
  try {
    return decodeURIComponent(detail.value?.detail || '')
  } catch {
    return detail.value?.detail || ''
  }
})

async function loadDetail() {
  loading.value = true
  try {
    const { lng, lat } = userStore.location
    const res = await getEventDetaiByIdAndLocation({ id: eventId.value, lng, lat })
    detail.value = res.data?.detail || {}
    subEventList.value = res.data?.items || []
    if (!activeItemId.value && subEventList.value.length) {
      activeItemId.value = subEventList.value[0].id
    }
  } finally {
    loading.value = false
  }
}

function flattenGroups(groups = []) {
  return groups.flatMap((group, idx) =>
    (group || []).map((row) => ({
      groupIndex: idx + 1,
      uid: row.uid,
      username: row.username || row.name || '-',
      score: row.score,
      rank: row.rank
    }))
  )
}

async function loadTabData() {
  if (!activeItemId.value) {
    return
  }
  tabLoading.value = true
  try {
    if (activeTab.value === 'groups') {
      const res = await getGroups({ eventid: eventId.value, itemid: activeItemId.value })
      const groups = res.data?.[activeItemId.value]?.groups || res.data?.[String(activeItemId.value)]?.groups || []
      groupRows.value = flattenGroups(groups)
      return
    }

    if (activeTab.value === 'results') {
      const res = await getAllResult({ eventid: eventId.value, itemid: activeItemId.value })
      const groups = res.data?.groups?.[activeItemId.value] || res.data?.groups?.[String(activeItemId.value)] || []
      resultRows.value = flattenGroups(groups)
      return
    }

    if (activeTab.value === 'honors') {
      const res = await getAllHonors({ eventid: eventId.value })
      const rows = res.data?.[activeItemId.value] || res.data?.[String(activeItemId.value)] || []
      honorRows.value = rows.filter((v) => Number(v.uid) !== 0)
      return
    }

    const res = await getScoreChangeByEventid(eventId.value)
    scoreRows.value = res.data?.sc?.[activeItemId.value] || res.data?.sc?.[String(activeItemId.value)] || []
  } finally {
    tabLoading.value = false
  }
}

async function openMembers() {
  if (!currentItem.value) {
    return
  }
  memberVisible.value = true
  memberLoading.value = true
  try {
    const res = await getMemberDetail({ match_id: detail.value.eventid, id: currentItem.value.id })
    memberRows.value = res.data?.list || []
  } finally {
    memberLoading.value = false
  }
}

function setChange(change) {
  const num = Number(change || 0)
  return num > 0 ? `+${num}` : String(num)
}

function goUser(uid) {
  if (!uid) {
    return
  }
  router.push(`/user/${uid}`)
}

watch(eventId, async () => {
  activeItemId.value = null
  activeTab.value = 'groups'
  memberRows.value = []
  await loadDetail()
  await loadTabData()
}, { immediate: true })

watch(activeItemId, () => {
  loadTabData()
})
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.item-info {
  margin-top: 14px;
}

.section-title {
  margin: 16px 0 10px;
  font-weight: 700;
}

.html {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  padding: 12px;
  color: #374151;
}
</style>
