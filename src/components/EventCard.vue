<template>
  <el-card class="event-card" shadow="hover" @click="goDetail">
    <div class="poster-wrap">
      <img :src="item.poster" class="poster" alt="poster" />
      <span class="city">{{ item.city || '-' }}</span>
    </div>
    <div class="content">
      <h3 class="title">{{ item.title }}</h3>
      <div class="line">{{ item.starttime }} <span class="status">{{ item.status }}</span></div>
      <div class="line">比赛地点: {{ item.arena_name || item.location || '-' }}</div>
      <div class="bottom">
        <span>{{ item.viewnum || 0 }} 人浏览</span>
        <el-tag type="success">{{ item.membernum || 0 }} 人参加</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function goDetail() {
  router.push(`/event/${props.item.eventid}`)
}
</script>

<style scoped>
.event-card {
  cursor: pointer;
  border-radius: 14px;
}

.poster-wrap {
  position: relative;
  height: 170px;
  overflow: hidden;
  border-radius: 10px;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 3px 8px;
  background: rgba(39, 135, 52, 0.9);
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
}

.content {
  padding-top: 10px;
}

.title {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
}

.line {
  color: #6b7280;
  margin-top: 6px;
  font-size: 13px;
}

.status {
  color: #ef9232;
  margin-left: 4px;
}

.bottom {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 12px;
}
</style>
