<template>
  <div>
    <el-card shadow="never" class="toolbar">
      <div class="toolbar-inner">
        <el-input v-model="keyword" placeholder="输入赛事关键词" clearable style="max-width: 300px" @keyup.enter="loadList(1, false)">
          <template #append>
            <el-button :icon="Search" @click="loadList(1, false)" />
          </template>
        </el-input>
        <el-button type="success" @click="syncBrowserLocation">使用浏览器定位</el-button>
        <el-text type="info">当前城市: {{ userStore.city.name }}</el-text>
      </div>
    </el-card>

    <el-row :gutter="16" class="list">
      <el-col v-for="item in rows" :key="item.eventid" :xs="24" :sm="12" :md="8" :lg="6">
        <EventCard :item="item" />
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !rows.length" description="暂无赛事" />

    <div class="pager">
      <el-button v-if="hasMore" :loading="loading" @click="loadMore">加载更多</el-button>
      <span v-else class="pager-end">没有更多数据了</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import EventCard from '../components/EventCard.vue'
import { getMatchListByPage } from '../api/match'
import { useUserStore } from '../stores/user'
import { toList } from '../utils/format'

const userStore = useUserStore()
const loading = ref(false)
const rows = ref([])
const keyword = ref('')
const page = ref(1)
const hasMore = ref(false)
const PAGE_SIZE = 10

async function loadList(nextPage = 1, append = false) {
  if (loading.value) {
    return
  }
  page.value = nextPage
  loading.value = true
  try {
    const { lng, lat } = userStore.location
    const res = await getMatchListByPage({
      lng,
      lat,
      city: userStore.city.name,
      eventTitle: keyword.value,
      sort: 4,
      search: keyword.value ? 1 : 0,
      page: nextPage
    })
    const incoming = toList(res.data)
    rows.value = append ? rows.value.concat(incoming) : incoming
    hasMore.value = incoming.length >= PAGE_SIZE
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) {
    return
  }
  loadList(page.value + 1, true)
}

function syncBrowserLocation() {
  if (!navigator.geolocation) {
    ElMessage.warning('浏览器不支持定位')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userStore.setLocation({
        lng: String(pos.coords.longitude),
        lat: String(pos.coords.latitude)
      })
      ElMessage.success('定位成功，已刷新赛事')
      loadList(1, false)
    },
    () => ElMessage.warning('定位失败，继续使用默认位置')
  )
}

watch(
  () => userStore.city.name,
  () => loadList(1, false)
)

loadList(1, false)
</script>

<style scoped>
.toolbar {
  margin-bottom: 14px;
}

.toolbar-inner {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.list {
  row-gap: 16px;
}

.pager {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pager-end {
  font-size: 13px;
  color: #909399;
}
</style>
