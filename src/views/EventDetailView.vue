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

    </el-card>

    <el-card style="margin-top: 14px">
      <el-tabs v-model="activeTab" @tab-change="loadTabData">
        <el-tab-pane label="赛程" name="groups" />
        <el-tab-pane label="成绩" name="results" />
        <el-tab-pane label="名次" name="honors" />
        <el-tab-pane label="积分变化" name="score" />
      </el-tabs>

      <div v-if="activeTab === 'groups'" class="schedule" v-loading="tabLoading">
        <div class="schedule-head">
          <div class="schedule-title">
            <span class="schedule-name">{{ currentItem?.name || '-' }}</span>
            <span v-if="currentItem?.qualNum > 0" class="schedule-qual">(小组出线{{ currentItem.qualNum }}人)</span>
          </div>
          <el-button class="schedule-btn" type="success" plain :disabled="!groupSections.length">
            {{ groupSections.length ? '录入成绩' : '设定中...' }}
          </el-button>
        </div>

        <template v-if="groupSections.length">
          <div v-for="(group, groupIndex) in groupSections" :key="groupIndex" class="schedule-group">
            <div class="schedule-group-title">第{{ groupIndex + 1 }}台</div>
            <div class="schedule-table-wrap">
              <el-table
                :data="buildGroupRows(group)"
                border
                class="schedule-table"
                :cell-style="setGroupCellStyle"
                :header-cell-style="setGroupHeaderStyle"
              >
                <el-table-column
                  prop="newUsername"
                  :label="`第${groupIndex + 1}组`"
                  width="120"
                  fixed="left"
                  align="center"
                >
                  <template #default="scope">
                    <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.newUsername }}</el-button>
                    <span v-else>{{ scope.row.newUsername }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="col in getGroupColumns(group)"
                  :key="col.key"
                  :prop="col.key"
                  :label="col.label"
                  :width="col.width"
                  align="center"
                >
                  <template #default="scope">{{ scope.row[col.key] ?? '' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
      </div>

      <div v-else-if="activeTab === 'results'" class="results" v-loading="tabLoading">
        <div v-if="resultHonors.length" class="results-honors">
          <div class="results-honors-title">名次列表</div>
          <div v-for="(item, index) in resultHonors" :key="index" class="results-honor-row" @click="goUser(item.uid)">
            <div class="results-honor-rank">{{ item.honor }}</div>
            <div class="results-honor-name" :class="{ 'is-first': index === 0 }">{{ item.name }}</div>
          </div>
        </div>

        <template v-if="resultGroups.length">
          <div v-for="(group, groupIndex) in resultGroups" :key="groupIndex" class="results-group">
            <div class="results-group-title">第{{ groupIndex + 1 }}台</div>
            <div class="results-table-wrap">
              <el-table
                :data="buildResultRows(group)"
                border
                class="results-table"
                :cell-style="setResultCellStyle"
                :header-cell-style="setResultHeaderStyle"
              >
                <el-table-column
                  prop="newUsername"
                  :label="`第${groupIndex + 1}组`"
                  width="120"
                  fixed="left"
                  align="center"
                >
                  <template #default="scope">
                    <el-button v-if="scope.row.uid" link type="primary" @click="goUser(scope.row.uid)">{{ scope.row.newUsername }}</el-button>
                    <span v-else>{{ scope.row.newUsername }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="col in getResultColumns(group)"
                  :key="col.key"
                  :prop="col.key"
                  :label="col.label"
                  :width="col.width"
                  align="center"
                >
                  <template #default="scope">{{ scope.row[col.key] ?? '' }}</template>
                </el-table-column>
                <el-table-column prop="score" label="积分" width="70" align="center" />
                <el-table-column prop="process" label="计算" width="90" align="center">
                  <template #default="scope">
                    <div class="results-calc">
                      <span v-for="(step, idx) in scope.row.process || []" :key="idx">{{ step }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="rank" label="名次" width="70" align="center" />
              </el-table>
            </div>

            <div v-if="group?.[0]?.detail_games?.length" class="results-detail">
              <div class="results-detail-toggle" @click="toggleGroupDetail(groupIndex)">
                {{ isGroupDetailOpen(groupIndex) ? '隐藏' : '显示' }}第{{ groupIndex + 1 }}组详细成绩
              </div>
              <template v-if="isGroupDetailOpen(groupIndex)">
                <div v-for="info in group[0].detail_games" :key="info.tgameid" class="results-detail-round">
                  <div class="results-detail-round-name">{{ info.roundname }}</div>
                  <div class="results-detail-table-wrap">
                    <el-table :data="info.games || []" border class="results-detail-table" :cell-style="setDetailCellStyle" :header-cell-style="setResultHeaderStyle">
                      <el-table-column type="index" label="序号" width="70" align="center" />
                      <el-table-column prop="username1" label="选手1" width="200" align="center">
                        <template #default="scope">
                          <div class="results-detail-name" :class="{ 'is-win': scope.row.result1 > scope.row.result2 }">{{ scope.row.username1 }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="username2" label="选手2" width="200" align="center">
                        <template #default="scope">
                          <div class="results-detail-name" :class="{ 'is-win': scope.row.result2 > scope.row.result1 }">{{ scope.row.username2 }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column label="比分" width="90" align="center">
                        <template #default="scope">{{ `${scope.row.result1}:${scope.row.result2}` }}</template>
                      </el-table-column>
                      <el-table-column label="详情" width="70" align="center">
                        <template #default="scope">
                          <el-icon v-if="String(scope.row.flag) === '0'"><ArrowRight /></el-icon>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <div v-if="resultTtRounds.length" class="results-tt">
          <div class="results-tt-title">淘汰赛对阵</div>
          <div class="results-tt-bracket">
            <div v-for="(round, roundIndex) in resultTtRounds" :key="roundIndex" class="results-tt-column">
              <div class="results-tt-round-name">{{ round.roundname }}</div>
              <div class="results-tt-round-body">
                <div
                  v-for="(game, gameIndex) in round.games"
                  :key="gameIndex"
                  class="results-tt-game"
                  :style="getTtGameStyle(roundIndex, gameIndex, round.games.length)"
                >
                  <div class="results-tt-player" :class="{ winner: game.winner1 }">
                    <span class="results-tt-name">{{ game.username1 }}</span>
                    <span class="results-tt-score">{{ game.result1 }}</span>
                  </div>
                  <div class="results-tt-divider"></div>
                  <div class="results-tt-player" :class="{ winner: game.winner2 }">
                    <span class="results-tt-name">{{ game.username2 }}</span>
                    <span class="results-tt-score">{{ game.result2 }}</span>
                  </div>
                  <div class="results-tt-connector" v-if="roundIndex < resultTtRounds.length - 1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="resultTtDetailGames.length" class="results-tt-detail">
          <div class="results-detail-toggle" @click="showTtDetail = !showTtDetail">
            {{ showTtDetail ? '隐藏' : '显示' }}淘汰赛详细成绩
          </div>
          <template v-if="showTtDetail">
            <div v-for="info in resultTtDetailGames" :key="info.tgameid" class="results-detail-round">
              <div class="results-detail-round-name">{{ info.roundname }}</div>
              <div class="results-detail-table-wrap">
                <el-table v-if="info.games?.length" :data="info.games" border class="results-detail-table" :cell-style="setDetailCellStyle" :header-cell-style="setResultHeaderStyle">
                  <el-table-column type="index" label="序号" width="70" align="center" />
                  <el-table-column prop="username1" label="选手1" width="200" align="center">
                    <template #default="scope">
                      <div class="results-detail-name" :class="{ 'is-win': scope.row.result1 > scope.row.result2 }">{{ scope.row.username1 }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="username2" label="选手2" width="200" align="center">
                    <template #default="scope">
                      <div class="results-detail-name" :class="{ 'is-win': scope.row.result2 > scope.row.result1 }">{{ scope.row.username2 }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="比分" width="90" align="center">
                    <template #default="scope">{{ `${scope.row.result1}:${scope.row.result2}` }}</template>
                  </el-table-column>
                  <el-table-column label="详情" width="70" align="center">
                    <template #default="scope">
                      <el-icon v-if="String(scope.row.flag) === '0'"><ArrowRight /></el-icon>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </template>
        </div>

        <div v-if="!resultGroups.length && resultInit" class="results-empty">暂无成绩信息</div>
      </div>

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

    <el-card style="margin-top: 14px">
      <div class="section-title">比赛信息</div>
      <div class="html" v-html="detailHtml"></div>
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
import { ArrowRight } from '@element-plus/icons-vue'
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

const groupSections = ref([])
const resultGroups = ref([])
const resultHonors = ref([])
const resultTtGames = ref([])
const resultTtDetailGames = ref([])
const resultInit = ref(false)
const showTtDetail = ref(false)
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

function buildGroupRows(group = []) {
  return (group || []).map((row, index) => ({
    ...row,
    newUsername: `${index + 1}${row.username || row.name || ''}`
  }))
}

function getGroupColumns(group = []) {
  const count = Array.isArray(group) ? group.length : 0
  const width = count ? Math.max(70, Math.floor(720 / count)) : 80
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width
  }))
}

function buildResultRows(group = []) {
  if (!Array.isArray(group) || !group.length) {
    return []
  }
  const { games = {}, colors = {}, teamid } = group[0]
  const viewId = teamid && teamid !== '0' ? 'teamid' : 'uid'
  return group.map((row, index) => {
    const matrix = group.reduce((acc, item, sindex) => {
      const key = `${group[index][viewId]}:${group[sindex][viewId]}`
      acc[`col${sindex + 1}`] = sindex === index ? '' : games[key]
      acc[`col${sindex + 1}-color`] = sindex === index ? '' : colors[key]
      if (viewId === 'uid') {
        acc[`col${sindex + 1}-info`] = sindex === index ? '' : { groupid: group[index].groupid, uid1: group[index][viewId], uid2: group[sindex][viewId] }
      }
      return acc
    }, {})
    return {
      ...row,
      ...matrix,
      newUsername: `${index + 1}${row.username || row.name || ''}`
    }
  })
}

function getResultColumns(group = []) {
  const count = Array.isArray(group) ? group.length : 0
  const width = count ? Math.max(50, Math.floor(360 / count)) : 60
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width
  }))
}

function setGroupHeaderStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px'
  }
}

function setGroupCellStyle({ row, rowIndex, columnIndex }) {
  const style = {
    fontSize: '12px',
    padding: '6px 4px'
  }
  if (rowIndex + 1 === columnIndex) {
    style.background = '#F2F1EE'
  }
  if (row?.uid && String(row.uid) === String(userStore.userInfo?.id)) {
    style.color = '#F89703'
    style.fontWeight = 600
  }
  return style
}

function setResultHeaderStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px'
  }
}

function setResultCellStyle({ row, rowIndex, columnIndex, column }) {
  const style = {
    fontSize: '12px',
    padding: '6px 4px',
    height: '32px'
  }
  if (rowIndex + 1 === columnIndex) {
    style.background = '#F2F1EE'
  }
  if (column?.property?.startsWith('col') && row[`${column.property}-color`] === 1) {
    style.color = '#E6326E'
  }
  if (column?.property === 'rank' && Number(row.rank) <= Number(currentItem.value?.qualNum || 0)) {
    style.color = '#E6326E'
    style.fontWeight = 600
  }
  return style
}

function setDetailCellStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px',
    background: '#F2F0F2',
    height: '32px'
  }
}

function toggleGroupDetail(index) {
  resultGroupDetailOpen.value = {}
  resultGroupDetailOpen.value[index] = !isGroupDetailOpen(index)
}

function isGroupDetailOpen(index) {
  return !!resultGroupDetailOpen.value[index]
}

function getWinnerFlags(game = {}) {
  const result1 = String(game.result1 || '').trim()
  const result2 = String(game.result2 || '').trim()
  const winnerFlags = { winner1: false, winner2: false }
  if (game.username1 === '轮空') {
    winnerFlags.winner2 = true
  } else if (game.username2 === '轮空') {
    winnerFlags.winner1 = true
  } else if (result2.includes('弃')) {
    winnerFlags.winner1 = true
  } else if (result1.includes('弃')) {
    winnerFlags.winner2 = true
  } else {
    const score1 = parseInt(result1, 10)
    const score2 = parseInt(result2, 10)
    if (!Number.isNaN(score1) && !Number.isNaN(score2)) {
      winnerFlags.winner1 = score1 > score2
      winnerFlags.winner2 = score2 > score1
    }
  }
  return winnerFlags
}

const resultGroupDetailOpen = ref({})
const resultTtRounds = computed(() => {
  return (resultTtGames.value || [])
    .slice()
    .sort((a, b) => Number(a?.games?.[0]?.round || 0) - Number(b?.games?.[0]?.round || 0))
    .map((round) => ({
      roundname: round.roundname,
      games: (round.games || []).map((game) => ({
        ...game,
        result1: String(game.result1 || '').trim(),
        result2: String(game.result2 || '').trim(),
        ...getWinnerFlags(game)
      }))
    }))
})

function getTtGameStyle(roundIndex, gameIndex, total) {
  const baseGap = 18
  const gap = baseGap * Math.pow(2, roundIndex)
  const offset = roundIndex === 0 ? 0 : gap / 2
  const marginBottom = gameIndex === total - 1 ? 0 : gap
  return {
    marginTop: gameIndex === 0 ? `${offset}px` : '0px',
    marginBottom: `${marginBottom}px`
  }
}

async function loadTabData() {
  if (!activeItemId.value) {
    return
  }
  tabLoading.value = true
  try {
    if (activeTab.value === 'groups') {
      groupSections.value = []
      const res = await getGroups({ eventid: eventId.value, itemid: activeItemId.value })
      const groups = res.data?.[activeItemId.value]?.groups || res.data?.[String(activeItemId.value)]?.groups || []
      groupSections.value = groups
      return
    }

    if (activeTab.value === 'results') {
      resultInit.value = false
      resultGroups.value = []
      resultHonors.value = []
      resultTtGames.value = []
      resultTtDetailGames.value = []
      resultGroupDetailOpen.value = {}
      showTtDetail.value = false
      const [resultRes, honorsRes] = await Promise.all([
        getAllResult({ eventid: eventId.value, itemid: activeItemId.value }),
        getAllHonors({ eventid: eventId.value })
      ])
      if (resultRes.data) {
        resultGroups.value = resultRes.data.groups?.[activeItemId.value] || resultRes.data.groups?.[String(activeItemId.value)] || []
        resultTtGames.value = resultRes.data.ttgames?.[activeItemId.value] || resultRes.data.ttgames?.[String(activeItemId.value)] || []
        resultTtDetailGames.value = resultRes.data.ttdetailgames?.[activeItemId.value] || resultRes.data.ttdetailgames?.[String(activeItemId.value)] || []
      }
      if (honorsRes.data) {
        resultHonors.value = honorsRes.data[activeItemId.value]?.filter((v) => Number(v.uid) !== 0) || honorsRes.data[String(activeItemId.value)]?.filter((v) => Number(v.uid) !== 0) || []
      }
      resultInit.value = true
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
  groupSections.value = []
  resultGroups.value = []
  resultHonors.value = []
  resultTtGames.value = []
  resultTtDetailGames.value = []
  resultGroupDetailOpen.value = {}
  resultInit.value = false
  showTtDetail.value = false
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

.schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.schedule-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #111827;
}

.schedule-name {
  font-size: 16px;
  font-weight: 700;
}

.schedule-qual {
  color: #6b7280;
  font-size: 13px;
}

.schedule-btn {
  border-color: #39b54a;
  color: #39b54a;
}

.schedule-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-group-title {
  color: #f89703;
  font-weight: 600;
}

.schedule-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  overflow-x: auto;
  background: #fff;
}

.schedule-table {
  min-width: 640px;
}

.schedule-table :deep(.el-table__header-wrapper),
.schedule-table :deep(.el-table__body-wrapper) {
  overflow: visible;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.results-honors {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.results-honors-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
}

.results-honor-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.results-honor-rank {
  width: 80px;
  color: #e6326e;
  font-weight: 600;
}

.results-honor-name {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #666;
  border-top: none;
  color: #2c84ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results-honor-name.is-first {
  border-top: 1px solid #666;
}

.results-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-group-title {
  color: #f89703;
  font-weight: 600;
}

.results-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  overflow-x: auto;
  background: #fff;
}

.results-table {
  min-width: 720px;
}

.results-table :deep(.el-table__header-wrapper),
.results-table :deep(.el-table__body-wrapper) {
  overflow: visible;
}

.results-calc {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
}

.results-detail {
  margin-top: 8px;
}

.results-detail-toggle {
  background: #fffb85;
  border: 1px solid #77b980;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.results-detail-round {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.results-detail-round-name {
  border: 1px solid #f89703;
  color: #f89703;
  padding: 2px 16px;
  font-size: 12px;
}

.results-detail-table-wrap {
  width: 640px;
  max-width: 100%;
}

.results-detail-table {
  width: 100%;
}

.results-detail-name {
  white-space: normal;
  line-height: 1.4;
}

.results-detail-name.is-win {
  color: #f89703;
  font-weight: 600;
}

.results-tt {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f5f5f5;
}

.results-tt-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.results-tt-bracket {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.results-tt-column {
  min-width: 220px;
}

.results-tt-round-name {
  text-align: center;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
}

.results-tt-round-body {
  position: relative;
  padding: 6px 10px;
}

.results-tt-game {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.results-tt-player {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.results-tt-divider {
  height: 1px;
  background: #eee;
  margin: 6px 0;
}

.results-tt-connector {
  position: absolute;
  right: -12px;
  top: 50%;
  width: 12px;
  height: 1px;
  background: #cbd5f5;
}

.results-tt-player.winner .results-tt-name {
  color: #ff3d00;
  font-weight: 700;
}

.results-tt-score {
  color: #248dff;
}

.results-tt-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-empty {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
</style>
