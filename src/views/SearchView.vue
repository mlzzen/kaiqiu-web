<template>
  <el-card>
    <el-tabs v-model="tab">
      <el-tab-pane label="比赛" name="match" />
      <el-tab-pane label="球馆" name="arena" />
      <el-tab-pane label="积分" name="player" />
    </el-tabs>

    <div class="filters">
      <el-input v-model="keyword" :placeholder="placeholder" clearable style="max-width: 320px" @keyup.enter="search(1)" />
      <template v-if="tab === 'match'">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 280px"
        />
        <el-select v-model="matchCity" filterable clearable placeholder="举办城市" style="width: 160px">
          <el-option v-for="item in cityOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
        <el-select v-model="distance" style="width: 140px">
          <el-option label="全部距离" value="" />
          <el-option label="20公里内" value="lt20" />
          <el-option label="50公里内" value="lt50" />
          <el-option label="100公里内" value="lt100" />
        </el-select>
        <el-select v-model="matchTags" multiple collapse-tags collapse-tags-tooltip placeholder="赛事标签" style="width: 220px">
          <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </template>
      <el-button type="success" @click="search(1)">搜索</el-button>
    </div>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column v-if="tab === 'match'" label="比赛名称" min-width="240">
        <template #default="scope">
          <el-button
            v-if="getEventId(scope.row)"
            link
            type="primary"
            @click="goEvent(scope.row)"
          >
            {{ scope.row.title }}
          </el-button>
          <span v-else>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'match'" label="状态" width="100">
        <template #default="scope">
          <el-tag size="small" :type="scope.row.status === '已结束' ? 'info' : 'success'">
            {{ scope.row.status || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'match'" label="城市" prop="city" width="120" />
      <el-table-column v-if="tab === 'match'" label="起止日期" min-width="240">
        <template #default="scope">
          {{ formatDateRange(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'match'" label="球馆" prop="arena_name" min-width="220" />
      <el-table-column v-if="tab === 'match'" label="参加人数" width="110">
        <template #default="scope">{{ `${scope.row.membernum || 0}人参加` }}</template>
      </el-table-column>
      <el-table-column v-if="tab === 'match'" label="浏览人数" width="110">
        <template #default="scope">{{ `${scope.row.viewnum || 0}人浏览` }}</template>
      </el-table-column>
      <el-table-column v-if="tab === 'match'" label="距离" width="140">
        <template #default="scope">{{ formatDistance(scope.row.juli) }}</template>
      </el-table-column>

      <el-table-column v-if="tab === 'arena'" label="球馆名称" prop="name" min-width="220" />
      <el-table-column v-if="tab === 'arena'" label="城市" prop="city" width="120" />
      <el-table-column v-if="tab === 'arena'" label="地址" prop="location" min-width="320" />

      <el-table-column v-if="tab === 'player'" label="昵称(username2)" min-width="220">
        <template #default="scope">
          <el-button
            v-if="scope.row.uid || scope.row.id"
            link
            type="primary"
            @click="goUser(scope.row.uid || scope.row.id)"
          >
            {{ scope.row.username2 || scope.row.username || '-' }}
          </el-button>
          <span v-else>{{ scope.row.username2 || scope.row.username || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'player'" label="省份(resideprovince)" prop="resideprovince" min-width="140" />
      <el-table-column v-if="tab === 'player'" label="生于(birthyear)" min-width="130">
        <template #default="scope">
          {{ scope.row.birthyear ? `${scope.row.birthyear}年` : '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'player'" label="当前积分" prop="score" width="110" />
      <el-table-column v-if="tab === 'player'" label="最高积分" prop="maxscore" width="110" />
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="10"
        :total="total"
        @current-change="search"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getArenaListPageByKey } from '../api/arena'
import { getMatchListPageByKey } from '../api/match'
import { getCities } from '../api/publicc'
import { getUserListPageByKey } from '../api/user'
import { useUserStore } from '../stores/user'
import { toList } from '../utils/format'

const userStore = useUserStore()
const router = useRouter()
const tab = ref('match')
const loading = ref(false)
const keyword = ref('')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const distance = ref('')

function formatYmd(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = formatYmd(new Date())
const dateRange = ref([today, today])
const matchCity = ref('')
const matchTags = ref([])
const cityOptions = ref([{ id: userStore.city.id, name: userStore.city.name }])
const tagOptions = ['网红', '大奖赛', '青少年', '观察员']

const placeholder = computed(() => {
  if (tab.value === 'arena') return '请输入球馆名称'
  if (tab.value === 'player') return '请输入用户昵称'
  return '请输入比赛名称'
})

async function search(nextPage = 1) {
  page.value = nextPage
  loading.value = true
  try {
    const { lng, lat } = userStore.location
    let res
    if (tab.value === 'match') {
      const [startDate, endDate] = dateRange.value || []
      const startMatchTimestamp = startDate ? String(Math.floor(new Date(`${startDate} 00:00:00`).getTime() / 1000)) : ''
      const endMatchTimestamp = endDate ? String(Math.floor(new Date(`${endDate} 23:59:59`).getTime() / 1000)) : ''
      res = await getMatchListPageByKey({
        lng,
        lat,
        city: matchCity.value || userStore.city.name,
        eventTitle: keyword.value,
        startMatchTimestamp,
        endMatchTimestamp,
        quickTags: matchTags.value.join(','),
        distance: distance.value,
        search: 1,
        page: nextPage
      })
    } else if (tab.value === 'arena') {
      res = await getArenaListPageByKey({
        lng,
        lat,
        key: keyword.value,
        page: nextPage
      })
    } else {
      res = await getUserListPageByKey({
        key: keyword.value,
        page: nextPage,
        now: userStore.city.name,
        city: '-1',
        sort: 2
      })
    }
    rows.value = toList(res.data)
    total.value = Number(res.data?.total || rows.value.length)
  } finally {
    loading.value = false
  }
}

watch(tab, () => {
  page.value = 1
  rows.value = []
  if (tab.value === 'match' && (!dateRange.value || dateRange.value.length !== 2)) {
    dateRange.value = [today, today]
  }
  search(1)
})

async function loadCities() {
  const res = await getCities()
  const rows = res.data?.data || []
  if (rows.length) {
    cityOptions.value = rows
  }
}

search(1)
loadCities()

function goUser(uid) {
  if (!uid) {
    return
  }
  router.push(`/user/${uid}`)
}

function getEventId(row) {
  return row?.eventid || row?.id || row?.match_id || null
}

function goEvent(row) {
  const eventId = getEventId(row)
  if (!eventId) {
    return
  }
  router.push(`/event/${eventId}`)
}

function formatDistance(juli) {
  if (juli === undefined || juli === null || juli === '') {
    return '-'
  }
  return `距您${Number(juli).toFixed(1)}公里`
}

function formatDateRange(row) {
  const start = row?.starttime || '-'
  const end = row?.endtime || ''
  return end ? `${start} 至 ${end}` : start
}
</script>

<style scoped>
.filters {
  margin: 6px 0 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}
</style>
