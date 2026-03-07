<template>
  <div class="set-score-page">
    <el-card>
      <template #header>
        <div class="header">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <span class="title">小组赛比分录入 - {{ currentItem?.name }}</span>
          <el-button type="primary" @click="refresh" :icon="Refresh">刷新</el-button>
          <el-button type="warning" @click="goTtScore">淘汰赛录入</el-button>
        </div>
      </template>

      <div v-loading="loading" class="groups-container">
        <el-tabs v-model="activeGroup" type="border-card">
          <el-tab-pane
            v-for="(group, groupIndex) in groups"
            :key="groupIndex"
            :label="`第${groupIndex + 1}组`"
            :name="groupIndex"
          >
            <div class="group-table-wrap">
              <el-table
                :data="buildGroupTableData(group, groupIndex)"
                border
                class="score-table"
                :cell-style="(...rest) => setCellStyle(...rest, group)"
                :header-cell-style="setHeaderCellStyle"
                @cell-click="handleCellClick"
              >
                <el-table-column
                  prop="username"
                  :label="`第${groupIndex + 1}组`"
                  width="120"
                  fixed="left"
                  align="center"
                >
                  <template #default="scope">
                    <span>{{ scope.row.username }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(col, colIndex) in getGroupColumns(group)"
                  :key="col.key"
                  :prop="col.key"
                  :label="col.label"
                  :width="col.width"
                  align="center"
                >
                  <template #default="scope">
                    <div :class="getCellClass(scope.row, col.key)">
                      {{ scope.row[col.key] || '' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="sumScore" label="积分" width="60" align="center" />
                <el-table-column prop="rank" label="名次" width="60" align="center" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 比分录入弹窗 -->
    <el-dialog v-model="dialogVisible" title="录入比分" width="420px" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="match-info">
          <span class="group-label">第{{ rowInfo.group }}组</span>
          <span class="players">{{ rowInfo.username1 }} vs {{ rowInfo.username2 }}</span>
          <span class="current-score" v-if="rowInfo.result">{{ rowInfo.result }}</span>
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
import { getGroupGames, updateScore } from '../api/match'
import { getEventDetaiByIdAndLocation, getGroups } from '../api/event'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const groups = ref([])
const groupsWithScore = ref({}) // 用于存储积分和名次数据
const activeGroup = ref(0)
const dialogVisible = ref(false)

const eventId = computed(() => route.params.eventid)
const itemId = computed(() => route.params.itemid)

const currentItem = ref({})

const scorePreList = ['0:0', '2:0', '2:1', '1:2', '0:2', '3:0', '3:1', '3:2', '2:3', '1:3', '0:3', '4:0', '4:1', '4:2', '4:3', '3:4', '2:4', '1:4', '0:4']

const rowInfo = ref({
  group: '',
  username1: '',
  username2: '',
  result: '',
  activeBifen: '',
  checkbox: [],
  uid1: '',
  uid2: '',
  groupid: '',
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
    // 获取比赛对阵数据
    const res = await getGroupGames({ eventid: eventId.value, itemid: itemId.value })
    groups.value = res.data || []

    // 获取积分和名次数据
    const scoreRes = await getGroups({ eventid: eventId.value, itemid: itemId.value })
    const groupsData = scoreRes.data?.[itemId.value]?.groups || scoreRes.data?.[String(itemId.value)]?.groups || []

    // 构建积分和名次的映射
    const scoreMap = {}
    groupsData.forEach(group => {
      if (group && Array.isArray(group)) {
        group.forEach(player => {
          const key = `${player.uid}`
          scoreMap[key] = {
            sumScore: player.score || player.sumScore || '',
            rank: player.rank || ''
          }
        })
      }
    })
    groupsWithScore.value = scoreMap
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function buildGroupTableData(group, groupIndex) {
  if (!group || !group.names) return []

  const { names, scores, groupid } = group

  return names.map((player, rowIndex) => {
    // 从映射中获取积分和名次
    const scoreInfo = groupsWithScore.value[player.uid] || {}

    const rowData = {
      ...player,
      groupid,
      sumScore: scoreInfo.sumScore || player.sumScore || player.score || '',
      rank: scoreInfo.rank || player.rank || ''
    }

    // 构建每行的对阵格数据
    names.forEach((opponent, colIndex) => {
      const key = `col${colIndex + 1}`
      if (rowIndex === colIndex) {
        rowData[key] = '' // 对角线是自己
      } else {
        const scoreKey = `${player.uid}:${opponent.uid}`
        const reverseKey = `${opponent.uid}:${player.uid}`
        rowData[key] = scores[scoreKey] || scores[reverseKey] || ''

        // 保存单元格信息用于点击编辑
        if (scores[scoreKey] || scores[reverseKey]) {
          rowData[`${key}-info`] = {
            uid1: player.uid,
            uid2: opponent.uid,
            username1: player.username,
            username2: opponent.username,
            groupid,
            result: scores[scoreKey] || scores[reverseKey],
            eventid: eventId.value,
            itemid: itemId.value
          }
        }
      }
    })

    return rowData
  })
}

function getGroupColumns(group) {
  if (!group || !group.names) return []
  const count = group.names.length
  const width = count ? Math.max(50, Math.floor(600 / count)) : 60
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width
  }))
}

function setHeaderCellStyle() {
  return {
    fontSize: '12px',
    padding: '8px 4px',
    textAlign: 'center'
  }
}

function setCellStyle({ row, column, rowIndex, columnIndex }, group) {
  const style = {
    fontSize: '12px',
    padding: '8px 4px',
    cursor: 'pointer'
  }

  // 对角线单元格显示灰色背景
  if (rowIndex + 1 === columnIndex) {
    style.background = '#F2F1EE'
  }

  // 有比分填充的单元格可以点击
  const prop = column.property
  if (prop && prop.startsWith('col') && row[`${prop}-info`]) {
    style.color = '#E6326E'
  }

  return style
}

function getCellClass(row, key) {
  if (row[`${key}-info`]) {
    return 'score-filled'
  }
  return ''
}

function handleCellClick(row, column, cell, event) {
  const prop = column.property
  if (!prop || !prop.startsWith('col')) return

  const info = row[`${prop}-info`]
  if (!info) return

  rowInfo.value = {
    ...info,
    group: activeGroup.value + 1,
    activeBifen: '',
    checkbox: [],
    result: info.result
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
  const { activeBifen, groupid, uid1, uid2, eventid, itemid } = rowInfo.value

  if (!activeBifen) {
    ElMessage.warning('请设置比分')
    return
  }

  updateScore({ groupid, score: activeBifen, uid1, uid2, eventid, itemid })
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

function goTtScore() {
  router.push(`/set-score/tt/${eventId.value}/${itemId.value}`)
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

.groups-container {
  min-height: 400px;
}

.group-table-wrap {
  overflow-x: auto;
  padding: 8px;
}

.score-table {
  width: 100%;
}

.score-table :deep(.el-table__header-wrapper th) {
  background: #f5f7fa;
}

.score-filled {
  color: #E6326E;
  font-weight: 600;
  cursor: pointer;
}

.dialog-content {
  padding: 8px 0;
}

.match-info {
  text-align: center;
  padding: 8px 0;
}

.group-label {
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
