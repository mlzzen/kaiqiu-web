<template>
  <div class="honors-wrap">
    <el-table :data="honorRows" stripe v-loading="loading" size="small">
      <el-table-column prop="honor" label="名次" width="70" />
      <el-table-column prop="teamname" label="队伍" min-width="120">
        <template #default="scope">{{ scope.row.teamname || scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="队员" min-width="200">
        <template #default="scope">
          <template v-if="scope.row.members && scope.row.members.length">
            <span v-for="(member, mIdx) in scope.row.members" :key="member.uid">
              <UserLink v-if="member.uid && member.uid !== '0'" :uid="member.uid" :name="member.name" />
              <span v-else>{{ member.name }}</span>
              <span v-if="mIdx < scope.row.members.length - 1"> / </span>
            </span>
          </template>
          <template v-else-if="scope.row.uid && scope.row.uid !== '0'">
            <UserLink :uid="scope.row.uid" :name="scope.row.name" />
          </template>
          <template v-else>
            {{ scope.row.name }}
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import UserLink from '../UserLink.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  honorRows: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.honors-wrap {
  overflow-x: auto;
}
</style>
