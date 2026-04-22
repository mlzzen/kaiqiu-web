<template>
  <el-card style="margin-top: 14px">
    <div class="section-title">比赛信息</div>
    <div class="html" v-html="detailHtml"></div>
  </el-card>
</template>

<script setup>
defineProps({
  detailHtml: {
    type: String,
    default: '',
  },
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

.html img {
  width: 500px !important;
}

:deep(.html img) {
  width: 500px !important;
}
</style>
