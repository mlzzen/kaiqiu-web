<template>
  <el-drawer
    :model-value="visible"
    size="72%"
    @update:model-value="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="drawer-header">
        <span>参赛名单</span>
        <el-button type="primary" :icon="Refresh" @click="$emit('refresh')" circle title="刷新" />
      </div>
    </template>
    <el-table :data="members" stripe v-loading="loading" height="100%">
      <el-table-column prop="number" label="#" width="60" />
      <el-table-column label="名称" min-width="180">
        <template #default="scope">
          <UserLink
            :uid="scope.row.uid"
            :name="scope.row.username"
            :sub-name="scope.row.realname"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="score"
        label="报名积分"
        width="120"
        sortable
        :sort-method="sortMemberScore"
      />
      <el-table-column
        label="确认"
        width="120"
        :filters="paidFilters"
        :filter-method="filterMemberPaid"
        column-key="paid"
      >
        <template #default="scope">
          <span v-if="scope.row.paid === 1" style="color: #67c23a; font-weight: bold">{{
            paidMap[scope.row.paid]
          }}</span>
          <span v-else-if="scope.row.paid === 2" style="color: #409eff; font-weight: bold">{{
            paidMap[scope.row.paid]
          }}</span>
          <span v-else>{{ paidMap[scope.row.paid] || scope.row.paid }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="性别"
        width="80"
        :filters="sexFilters"
        :filter-method="filterMemberSex"
        column-key="sex"
      >
        <template #default="scope">{{ sexMap[scope.row.sex] || '-' }}</template>
      </el-table-column>
    </el-table>
  </el-drawer>
</template>

<script setup>
import { Refresh } from '@element-plus/icons-vue';
import UserLink from './UserLink.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  members: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:visible', 'refresh']);

const paidMap = { 0: '交费处理中', 1: '已交费', 2: '已报名' };
const sexMap = { 1: '男', 2: '女' };
const paidFilters = Object.keys(paidMap).map((key) => ({ text: paidMap[key], value: String(key) }));
const sexFilters = Object.keys(sexMap).map((key) => ({ text: sexMap[key], value: String(key) }));

function sortMemberScore(a, b) {
  const left = Number(a?.score ?? 0);
  const right = Number(b?.score ?? 0);
  if (Number.isNaN(left) || Number.isNaN(right)) {
    return String(a?.score ?? '').localeCompare(String(b?.score ?? ''));
  }
  return left - right;
}

function filterMemberPaid(value, row) {
  return String(row?.paid ?? '') === String(value);
}

function filterMemberSex(value, row) {
  return String(row?.sex ?? '') === String(value);
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
