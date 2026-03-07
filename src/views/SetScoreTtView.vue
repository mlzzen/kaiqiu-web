<template>
  <div class="set-score-page">
    <el-card>
      <template #header>
        <div class="header">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <span class="title">淘汰赛比分录入 - {{ currentItem?.name }}</span>
          <el-button type="primary" @click="refresh" :icon="Refresh">刷新</el-button>
          <el-button type="warning" @click="goGroupScore">小组赛录入</el-button>
        </div>
      </template>

      <div v-loading="loading" class="knockout-container">
        <div v-if="!list.length" class="empty-tip">暂无淘汰赛数据</div>
        <div v-else class="rounds-container">
          <div v-for="(round, roundIndex) in list" :key="roundIndex" class="round-section">
            <div class="round-name">{{ round.roundname }}</div>
            <el-table
              :data="round.games"
              border
              class="knockout-table"
              :cell-style="setCellStyle"
              :header-cell-style="setHeaderCellStyle"
              @cell-click="handleCellClick"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="username1" label="选手1" min-width="140" align="center">
                <template #default="scope">
                  <span :class="{ winner: scope.row.winner1 }">{{ scope.row.username1 || '待定' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="比分" width="100" align="center">
                <template #default="scope">
                  <div class="score-cell">
                    {{ formatScore(scope.row.result1) }}:{{ formatScore(scope.row.result2) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="username2" label="选手2" min-width="140" align="center">
                <template #default="scope">
                  <span :class="{ winner: scope.row.winner2 }">{{ scope.row.username2 || '待定' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="gameRemark" label="详情" width="80" align="center" />
            </el-table>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 比分录入弹窗 -->
    <el-dialog v-model="dialogVisible" title="录入比分" width="420px" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="match-info">
          <span class="round-label">{{ rowInfo.roundname }}</span>
          <span class="players">{{ rowInfo.username1 }} vs {{ rowInfo.username2 }}</span>
          <span class="current-score" v-if="rowInfo.result1 !== undefined">
            {{ formatScore(rowInfo.result1) }}:{{ formatScore(rowInfo.result2) }}
          </span>
        </div>

        <el-divider />

        <div class="score-section">
          <div class="score-label">比分</div>
          <div class="score-grid">
            <div
              v-for="item in scorePreList"
              :key="item"
              :class="['score-item', { active: item === rowInfo.activeBifen }]"
              @click="selectScore(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <div class="waiver-section">
          <div class="waiver-label">弃权</div>
          <el-checkbox-group v-model="rowInfo.checkbox" @change="handleWaiverChange">
            <el-checkbox label="username1">{{ rowInfo.username1 }}</el-checkbox>
            <el-checkbox label="username2">{{ rowInfo.username2 }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="submitScore">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { getArrangeKnockout, updateTtScore } from '../api/match'
import { getEventDetaiByIdAndLocation } from '../api/event'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref([])
const dialogVisible = ref(false)

const eventId = computed(() => route.params.eventid)
const itemId = computed(() => route.params.itemid)

const currentItem = ref({})

const scorePreList = ['0:0', '2:0', '2:1', '1:2', '0:2', '3:0', '3:1', '3:2', '2:3', '1:3', '0:3', '4:0', '4:1', '4:2', '4:3', '3:4', '2:4', '1:4', '0:4']

const rowInfo = ref({
  roundname: '',
  username1: '',
  username2: '',
  result1: '',
  result2: '',
  activeBifen: '',
  checkbox: [],
  gameid: '',
  uid1: '',
  uid2: '',
  eventid: '',
  itemid: ''
})

async function loadDetail() {
  try {
    const { lng, lat } = userStore.location
    const res = await getEventDetaiByIdAndLocation({ id: eventId.value, lng, lat })
    const items = res.data?.items || []
    currentItem.value = items.find(v => String(v.id) === String(itemId.value)) || {}
  } catch (e) {
    console.error('loadDetail error:', e)
  }
}

async function refresh() {
  loading.value = true
  try {
    const res = await getArrangeKnockout({ eventid: eventId.value, itemid: itemId.value })
    list.value = res.data || []
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function formatScore(score) {
  if (score === undefined || score === null || score === '') return '-'
  return score
}

function getWinnerFlags(game) {
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

function setHeaderCellStyle() {
  return {
    fontSize: '12px',
    padding: '8px 4px',
    textAlign: 'center'
  }
}

function setCellStyle({ row, column, rowIndex, columnIndex }) {
  const style = {
    fontSize: '12px',
    padding: '8px 4px',
    cursor: 'pointer'
  }

  // 比分列可以点击
  if (column.label === '比分') {
    style.color = '#E6326E'
    style.fontWeight = '600'
  }

  return style
}

function handleCellClick(row, column, cell, event) {
  if (column.label !== '比分') return

  // 检查选手是否已确定
  if (!row.username1 || !row.username2) {
    ElMessage.warning('选手未确定，无法录入比分')
    return
  }

  const winnerFlags = getWinnerFlags(row)

  rowInfo.value = {
    roundname: row.roundname || '',
    username1: row.username1,
    username2: row.username2,
    result1: row.result1,
    result2: row.result2,
    activeBifen: '',
    checkbox: [],
    gameid: row.gameid || row.id || '',
    uid1: row.uid1 || '',
    uid2: row.uid2 || '',
    eventid: eventId.value,
    itemid: itemId.value,
    winner1: winnerFlags.winner1,
    winner2: winnerFlags.winner2
  }

  dialogVisible.value = true
}

function selectScore(item) {
  rowInfo.value.activeBifen = item
  rowInfo.value.checkbox = []
}

function handleWaiverChange(values) {
  rowInfo.value.activeBifen = ''
  if (values.length === 2) {
    rowInfo.value.activeBifen = 'wo:wo'
  } else if (values.length === 1) {
    if (values[0] === 'username1') {
      rowInfo.value.activeBifen = 'wo:2'
    } else {
      rowInfo.value.activeBifen = '2:wo'
    }
  }
}

function submitScore() {
  const { activeBifen, gameid, uid1, uid2, eventid, itemid } = rowInfo.value

  if (!activeBifen) {
    ElMessage.warning('请设置比分')
    return
  }

  // 淘汰赛不支持同时弃权
  if (activeBifen === 'wo:wo') {
    ElMessage.warning('淘汰赛不支持同时弃权')
    return
  }

  updateTtScore({ groupid: -1, score: activeBifen, gameid, uid1, uid2, eventid, itemid })
    .then(() => {
      ElMessage.success('比分更新成功')
      dialogVisible.value = false
      refresh()
    })
    .catch(() => {
      ElMessage.error('更新失败')
    })
}

function goBack() {
  router.back()
}

function goGroupScore() {
  router.push(`/set-score/group/${eventId.value}/${itemId.value}`)
}

loadDetail()
refresh()
</script>

<style scoped>
.set-score-page {
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.knockout-container {
  min-height: 400px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.rounds-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.round-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.round-name {
  text-align: center;
  color: #F89703;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  padding: 4px 16px;
  display: inline-block;
  border: 1px solid #F89703;
  border-radius: 4px;
}

.knockout-table {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.score-cell {
  cursor: pointer;
}

.winner {
  color: #E6326E;
  font-weight: 600;
}

.dialog-content {
  padding: 8px 0;
}

.match-info {
  text-align: center;
  padding: 8px 0;
}

.round-label {
  color: #F89703;
  font-weight: 600;
  margin-right: 12px;
}

.players {
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
}

.current-score {
  color: #E6326E;
  font-weight: 600;
}

.score-section {
  margin: 16px 0;
}

.score-label {
  margin-bottom: 12px;
  font-weight: 600;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.score-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.score-item:hover {
  border-color: #77B980;
}

.score-item.active {
  background: #77B980;
  color: #fff;
  border-color: #77B980;
}

.waiver-section {
  margin-top: 16px;
}

.waiver-label {
  margin-bottom: 8px;
  font-weight: 600;
}
</style>
