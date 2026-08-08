<template>
  <div class="results" v-loading="loading">
    <HonorsList :honors="resultHonors" />
    <GroupResults :groups="resultGroups" :current-item="currentItem" />
    <TtBracket :tt-games="resultTtGames" />
    <TtDetail
      :tt-detail-games="resultTtDetailGames"
      :event-id="eventId"
      :item-id="currentItem?.id"
    />
    <div v-if="!resultGroups.length && resultInit" class="results-empty">暂无成绩信息</div>
  </div>
</template>

<script setup>
import HonorsList from './HonorsList.vue';
import GroupResults from './GroupResults.vue';
import TtBracket from './TtBracket.vue';
import TtDetail from './TtDetail.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  resultGroups: {
    type: Array,
    default: () => [],
  },
  resultHonors: {
    type: Array,
    default: () => [],
  },
  resultTtGames: {
    type: Array,
    default: () => [],
  },
  resultTtDetailGames: {
    type: Array,
    default: () => [],
  },
  resultInit: {
    type: Boolean,
    default: false,
  },
  currentItem: {
    type: Object,
    default: null,
  },
  eventId: {
    type: [String, Number],
    default: '',
  },
});
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
