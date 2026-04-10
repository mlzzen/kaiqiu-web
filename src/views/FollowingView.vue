<template>
  <el-card>
    <template #header>
      <div class="header">我的关注</div>
    </template>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column label="头像" width="90">
        <template #default="scope">
          <router-link :to="`/user/${scope.row.fuid}`">
            <el-avatar :src="scope.row.face_url" :size="46" />
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="姓名" min-width="200">
        <template #default="scope">
          <UserLink
                    :uid="scope.row.fuid"
                    :name="scope.row.nickname"
                    :sub-name="scope.row.realname" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320">
        <template #default="scope">
          <UserLink :uid="scope.row.fuid" name="进入主页" />
          <el-button link type="success" style="margin-left: 16px" @click="toggleMatches(scope.row)">
            {{ expandedUid === scope.row.fuid ? '收起近期赛事' : '查看近期赛事' }}
          </el-button>
          <el-button link type="danger" @click="cancelFollow(scope.row)">不再关注</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="`${expandedNickname} - 近期报名赛事`" width="680px" destroy-on-close>
      <el-empty v-if="!expandedMatches.length" description="暂无近期报名比赛" />
      <el-table v-else :data="expandedMatches" stripe>
        <el-table-column label="海报" width="80">
          <template #default="scope">
            <EventLink :event-id="scope.row.eventid">
              <el-image :src="scope.row.poster" fit="cover" style="width:60px;height:60px;border-radius:4px;" />
            </EventLink>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="赛事" min-width="280" />
        <el-table-column label="地区" min-width="180">
          <template #default="scope">{{ scope.row.province }} {{ scope.row.city }}</template>
        </el-table-column>
        <el-table-column label="详情" width="120">
          <template #default="scope">
            <EventLink :event-id="scope.row.eventid" name="进入赛事" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import UserLink from '../components/UserLink.vue';
import EventLink from '../components/EventLink.vue';
import { getFolloweeEnrolledMatch, getUserFolloweesList, goCancelFolloweeByUid } from '../api/user';

const loading = ref(false);
const rows = ref([]);
const dialogVisible = ref(false);
const expandedUid = ref('');
const expandedNickname = ref('');
const expandedMatches = ref([]);

async function loadRows() {
  loading.value = true;
  try {
    const res = await getUserFolloweesList();
    rows.value = res.data?.followeesList || [];
    // 存储到 localstorage
    const followees = rows.value.map((item) => item.fuid);
    localStorage.setItem('userFollowees', JSON.stringify(followees));
  } finally {
    loading.value = false;
  }
}

async function toggleMatches(row) {
  if (expandedUid.value === row.fuid) {
    dialogVisible.value = false;
    expandedUid.value = '';
    expandedNickname.value = '';
    expandedMatches.value = [];
    return;
  }
  const res = await getFolloweeEnrolledMatch(row.fuid);
  expandedUid.value = row.fuid;
  expandedNickname.value = row.nickname;
  expandedMatches.value = res.data?.enrolledMatchList || [];
  dialogVisible.value = true;
}

async function cancelFollow(row) {
  try {
    await ElMessageBox.confirm('确认要取消关注吗？', '提示', { type: 'warning' });
  } catch {
    return;
  }
  await goCancelFolloweeByUid(row.fuid);
  rows.value = rows.value.filter((v) => v.fuid !== row.fuid);
  // 更新 localstorage
  const followees = rows.value.map((item) => item.fuid);
  localStorage.setItem('userFollowees', JSON.stringify(followees));
  if (expandedUid.value === row.fuid) {
    dialogVisible.value = false;
    expandedUid.value = '';
    expandedNickname.value = '';
    expandedMatches.value = [];
  }
}

loadRows();
</script>

<style scoped>
.header {
  font-weight: 700;
}

.inner {
  margin-top: 14px;
}

.avatar-btn {
  padding: 0;
}

.link-primary {
  color: #409eff;
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>
