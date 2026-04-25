<template>
  <div class="event-member-list" :class="{ mobile: isMobile }">
    <div class="page-header">
      <el-button text :icon="ArrowLeft" @click="goBack">返回</el-button>
      <span class="page-title">参赛名单</span>
      <el-button type="primary" :icon="Refresh" @click="loadData" circle title="刷新" />
    </div>

    <el-table
      :data="members"
      stripe
      v-loading="loading"
      height="calc(100vh - 120px)"
      max-height="calc(100vh - 120px)"
      :class="{ compact: isMobile }"
    >
      <el-table-column prop="number" label="#" :width="isMobile ? 36 : 60" />
      <el-table-column label="名称" :min-width="isMobile ? 80 : 180">
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
        :width="isMobile ? 72 : 120"
        sortable
        :sort-method="sortMemberScore"
      />
      <el-table-column
        label="确认"
        :width="isMobile ? 64 : 120"
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
        :width="isMobile ? 44 : 80"
        :filters="sexFilters"
        :filter-method="filterMemberSex"
        column-key="sex"
      >
        <template #default="scope">{{ sexMap[scope.row.sex] || '-' }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { getMemberDetail } from '../api/event';
import UserLink from '../components/UserLink.vue';

const route = useRoute();
const router = useRouter();

const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

const loading = ref(false);
const members = ref([]);
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

function goBack() {
  router.back();
}

async function loadData() {
  loading.value = true;
  try {
    const res = await getMemberDetail({
      match_id: route.params.eventid,
      id: route.params.itemid,
    });
    members.value = res.data?.list || [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.event-member-list {
  padding: 16px;
}

.event-member-list.mobile {
  padding: 4px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  flex: 1;
}

.event-member-list.mobile :deep(.el-table.compact) {
  font-size: 12px;
}

.event-member-list.mobile :deep(.el-table.compact .el-table__cell) {
  padding: 4px 2px;
}
</style>
