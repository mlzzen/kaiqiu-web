<template>
  <div>
    <el-card shadow="never" class="toolbar">
      <div class="toolbar-inner">
        <el-input v-model="keyword" placeholder="输入赛事关键词" clearable style="max-width: 300px" @keyup.enter="loadList(1)">
          <template #append>
            <el-button :icon="Search" @click="loadList(1)" />
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
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="query.page"
        :page-size="10"
        :total="total"
        @current-change="loadList"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import EventCard from '../components/EventCard.vue'
import { getMatchListByPage } from '../api/match'
import { useUserStore } from '../stores/user'
import { toList } from '../utils/format'

const userStore = useUserStore()
const loading = ref(false)
const rows = ref([])
const total = ref(0)
const keyword = ref('')
const query = reactive({ page: 1 })

async function loadList(page = 1) {
  query.page = page
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
      page
    })
    rows.value = toList(res.data)
    total.value = Number(res.data?.total || rows.value.length)
  } finally {
    loading.value = false
  }
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
      loadList(1)
    },
    () => ElMessage.warning('定位失败，继续使用默认位置')
  )
}

watch(
  () => userStore.city.name,
  () => loadList(1)
)

loadList(1)
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
}
</style>
