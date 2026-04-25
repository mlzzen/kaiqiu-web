<template>
  <el-card style="margin-top: 14px" class="event-info-card" :class="{ mobile: isMobile }">
    <div class="section-title">比赛信息</div>
    <div class="html" v-html="detailHtml"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

defineProps({
  detailHtml: {
    type: String,
    default: '',
  },
});

const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style scoped>
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

:deep(.html img) {
  width: 500px !important;
  max-width: 100%;
}

.event-info-card.mobile :deep(.html img) {
  width: 100% !important;
}
</style>
