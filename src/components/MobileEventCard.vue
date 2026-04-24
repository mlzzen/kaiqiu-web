<template>
  <div class="match-card" @click="goEvent">
    <div class="card-poster">
      <img :src="item.poster || defaultPoster" alt="poster" />
      <span class="card-city-tag">{{ item.city || '' }}</span>
    </div>
    <div class="card-info">
      <div class="card-title">{{ item.title || '-' }}</div>
      <div class="card-row">
        <span class="card-date">{{ item.starttime || '-' }}</span>
        <span :class="['card-status', statusClass(item.status)]">{{ item.status || '-' }}</span>
      </div>
      <div class="card-row card-location">{{ item.city || '' }}{{ item.arena_name ? ` ${item.arena_name}` : '' }}</div>
      <div class="card-row card-meta">
        <span>{{ formatDistance(item.juli) }}</span>
        <span>{{ `${item.viewnum || 0}人浏览` }}</span>
        <span>{{ `${item.membernum || 0}人参加` }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const defaultPoster = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="#f0f0f0" width="200" height="150"/><text x="100" y="80" text-anchor="middle" fill="#ccc" font-size="14">暂无海报</text></svg>');

function getEventId(row) {
  return row?.eventid || row?.id || row?.match_id || null;
}

function goEvent() {
  const eventId = getEventId(props.item);
  if (eventId) {
    router.push(`/event/${eventId}`);
  }
}

function formatDistance(juli) {
  if (juli === undefined || juli === null || juli === '') {
    return '-';
  }
  return `距您${Number(juli).toFixed(1)}公里`;
}

function statusClass(status) {
  if (status === '已结束') return 'status-ended';
  if (status === '报名中') return 'status-open';
  if (status === '进行中') return 'status-active';
  return 'status-default';
}
</script>

<style scoped>
.match-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  cursor: pointer;
}

.card-poster {
  position: relative;
  width: 33.33%;
  flex-shrink: 0;
  overflow: hidden;
}

.card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-city-tag {
  position: absolute;
  top: 6px;
  left: 0;
  background: #4caf50;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 0 4px 4px 0;
  line-height: 1.4;
}

.card-info {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.card-date {
  color: #606266;
}

.card-location {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-status {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 4px;
  line-height: 1.6;
  flex-shrink: 0;
}

.status-ended {
  background: #f0f0f0;
  color: #909399;
}

.status-open {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-active {
  background: #e3f2fd;
  color: #1565c0;
}

.status-default {
  background: #fff3e0;
  color: #e65100;
}
</style>
