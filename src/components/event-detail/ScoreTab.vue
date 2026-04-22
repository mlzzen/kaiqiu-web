<template>
  <el-table :data="scoreRows" stripe v-loading="loading">
    <el-table-column label="姓名" min-width="160">
      <template #default="scope">
        <UserLink :uid="scope.row.uid" :name="scope.row.realname" />
      </template>
    </el-table-column>
    <el-table-column prop="prescore" label="赛前积分" width="120" />
    <el-table-column prop="postscore" label="赛后积分" width="120" />
    <el-table-column label="变化" width="100">
      <template #default="scope">{{ setChange(scope.row.change) }}</template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import UserLink from '../UserLink.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  scoreRows: {
    type: Array,
    default: () => [],
  },
});

function setChange(change) {
  const num = Number(change || 0);
  return num > 0 ? `+${num}` : String(num);
}
</script>
