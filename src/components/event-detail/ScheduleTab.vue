<template>
  <div class="schedule" v-loading="loading" :class="{ 'mobile': isMobile }">
    <div class="schedule-head">
      <div class="schedule-title">
        <span class="schedule-name">{{ currentItem?.name || '-' }}</span>
        <span v-if="currentItem?.qualNum > 0" class="schedule-qual">(小组出线{{ currentItem.qualNum }}人)</span>
      </div>
      <el-button class="schedule-btn" type="success" plain :disabled="!groupSections.length" @click="$emit('goSetScore')" size="small">
        {{ groupSections.length ? '录入成绩' : '设定中...' }}
      </el-button>
    </div>

    <template v-if="groupSections.length">
      <div
        v-for="(group, groupIndex) in groupSections"
        :key="groupIndex"
        class="schedule-group">
        <div class="schedule-group-title">第{{ groupIndex + 1 }}台</div>
        <div class="schedule-table-wrap">
          <el-table
            :data="buildGroupRows(group)"
            border
            class="schedule-table"
            :cell-style="setGroupCellStyle"
            :header-cell-style="setGroupHeaderStyle"
            size="small">
            <el-table-column
              prop="newUsername"
              :label="`第${groupIndex + 1}组`"
              width="100"
              fixed="left"
              align="center">
              <template #default="scope">
                <UserLink :uid="scope.row.uid" :name="scope.row.newUsername" />
              </template>
            </el-table-column>
            <el-table-column v-for="col in getGroupColumns(group)" :key="col.key" :prop="col.key" :label="col.label"
              :width="col.width" align="center">
              <template #default="scope">{{ scope.row[col.key] ?? '' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import UserLink from '../UserLink.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  groupSections: {
    type: Array,
    default: () => [],
  },
  currentItem: {
    type: Object,
    default: null,
  },
});

defineEmits(['goSetScore']);

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

function buildGroupRows(group = []) {
  return (group || []).map((row, index) => ({
    ...row,
    newUsername: `${index + 1}${row.username || row.name || ''}`,
  }));
}

function getGroupColumns(group = []) {
  const count = Array.isArray(group) ? group.length : 0;
  const width = count ? Math.max(50, Math.floor(600 / count)) : 60;
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width,
  }));
}

function setGroupHeaderStyle() {
  return {
    fontSize: '11px',
    padding: '4px 2px',
  };
}

function setGroupCellStyle({ row, rowIndex, columnIndex }) {
  const style = {
    fontSize: '11px',
    padding: '4px 2px',
    height: '28px',
  };
  if (rowIndex + 1 === columnIndex) {
    style.background = '#F2F1EE';
  }
  return style;
}
</script>

<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.schedule-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #111827;
}

.schedule-name {
  font-size: 16px;
  font-weight: 700;
}

.schedule-qual {
  color: #6b7280;
  font-size: 13px;
}

.schedule-btn {
  border-color: #39b54a;
  color: #39b54a;
}

.schedule-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-group-title {
  color: #f89703;
  font-weight: 600;
}

.schedule-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  overflow-x: auto;
  background: #fff;
}

.schedule-table {
  min-width: 500px;
}

.schedule-table :deep(.el-table__header-wrapper),
.schedule-table :deep(.el-table__body-wrapper) {
  overflow: visible;
}
</style>
