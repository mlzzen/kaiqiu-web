<template>
  <el-card>
    <el-tabs v-model="tab">
      <el-tab-pane label="比赛" name="match" />
      <el-tab-pane label="球馆" name="arena" />
      <el-tab-pane label="积分" name="player" />
    </el-tabs>

    <div class="filters">
      <el-input v-model="keyword" :placeholder="placeholder" clearable style="max-width: 320px" @keyup.enter="search(1)" />
      <el-select v-if="tab === 'match'" v-model="distance" style="width: 140px">
        <el-option label="全部距离" value="" />
        <el-option label="20公里内" value="lt20" />
        <el-option label="50公里内" value="lt50" />
      </el-select>
      <el-button type="success" @click="search(1)">搜索</el-button>
    </div>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column v-if="tab === 'match'" label="比赛名称" prop="title" min-width="240" />
      <el-table-column v-if="tab === 'match'" label="城市" prop="city" width="120" />
      <el-table-column v-if="tab === 'match'" label="开始时间" prop="starttime" width="180" />
      <el-table-column v-if="tab === 'match'" label="球馆" prop="arena_name" min-width="220" />

      <el-table-column v-if="tab === 'arena'" label="球馆名称" prop="name" min-width="220" />
      <el-table-column v-if="tab === 'arena'" label="城市" prop="city" width="120" />
      <el-table-column v-if="tab === 'arena'" label="地址" prop="location" min-width="320" />

      <el-table-column v-if="tab === 'player'" label="昵称" min-width="180">
        <template #default="scope">
          <el-button v-if="scope.row.uid || scope.row.id" link type="primary" @click="goUser(scope.row.uid || scope.row.id)">{{ scope.row.username }}</el-button>
          <span v-else>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="tab === 'player'" label="真实姓名" prop="realname" min-width="140" />
      <el-table-column v-if="tab === 'player'" label="积分" prop="score" width="100" />
      <el-table-column v-if="tab === 'player'" label="城市" prop="city" width="120" />
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
      res = await getMatchListPageByKey({
        lng,
        lat,
        city: userStore.city.name,
        eventTitle: keyword.value,
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
  search(1)
})

search(1)

function goUser(uid) {
  if (!uid) {
    return
  }
  router.push(`/user/${uid}`)
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
