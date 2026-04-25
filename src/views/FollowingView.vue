<template>
  <!-- 手机端布局 -->
  <div class="following-mobile" v-if="isMobile">
    <div class="following-header">我的关注</div>
    <div v-if="!rows.length && !loading" class="following-empty">暂无关注</div>
    <div v-else class="following-list">
      <div v-for="row in rows" :key="row.fuid" class="following-item">
        <div class="following-row" @click="toggleMatches(row)">
          <div class="following-info">
            <router-link :to="`/user/${row.fuid}`" @click.stop>
              <el-avatar :src="row.face_url" :size="50" />
            </router-link>
            <div class="following-text">
              <div class="following-name">
                <UserLink :uid="row.fuid" :name="row.nickname" :sub-name="row.realname" />
              </div>
              <div class="following-expand-hint">
                {{ expandedUid === row.fuid ? '点击收起' : '查看近期赛事' }}
              </div>
            </div>
          </div>
          <div class="following-actions">
            <router-link :to="`/user/${row.fuid}`" @click.stop>
              <el-button size="small" type="primary" plain>进入主页</el-button>
            </router-link>
            <el-button size="small" type="danger" plain @click.stop="cancelFollow(row)"
              >不再关注</el-button
            >
          </div>
        </div>
        <div v-if="expandedUid === row.fuid" class="following-expanded">
          <div class="following-expanded-title">{{ row.nickname }}的近期报名赛事</div>
          <el-table v-if="expandedMatches.length" :data="expandedMatches" size="small">
            <el-table-column prop="title" label="赛事" min-width="180">
              <template #default="scope">
                <EventLink :event-id="scope.row.eventid" :name="scope.row.title" />
              </template>
            </el-table-column>
            <el-table-column label="地区" width="100">
              <template #default="scope">{{ scope.row.city || scope.row.province }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无近期报名比赛" :image-size="60" />
        </div>
      </div>
    </div>
    <div v-loading="loading" class="following-loading" />
  </div>

  <!-- 桌面端布局 -->
  <el-card v-else>
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
            :sub-name="scope.row.realname"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320">
        <template #default="scope">
          <UserLink :uid="scope.row.fuid" name="进入主页" />
          <el-button
            link
            type="success"
            style="margin-left: 16px"
            @click="toggleMatches(scope.row)"
          >
            查看近期赛事
          </el-button>
          <el-button link type="danger" @click="cancelFollow(scope.row)">不再关注</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="`${expandedNickname} - 近期报名赛事`"
      width="680px"
      destroy-on-close
    >
      <el-empty v-if="!expandedMatches.length" description="暂无近期报名比赛" />
      <el-table v-else :data="expandedMatches" stripe>
        <el-table-column label="海报" width="80">
          <template #default="scope">
            <EventLink :event-id="scope.row.eventid">
              <el-image
                :src="scope.row.poster"
                fit="cover"
                style="width: 60px; height: 60px; border-radius: 4px"
              />
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
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

async function loadRows() {
  loading.value = true;
  try {
    const res = await getUserFolloweesList();
    rows.value = res.data?.followeesList || [];
    const followees = rows.value.map((item) => item.fuid);
    localStorage.setItem('userFollowees', JSON.stringify(followees));
  } finally {
    loading.value = false;
  }
}

async function toggleMatches(row) {
  if (expandedUid.value === row.fuid) {
    expandedUid.value = '';
    expandedNickname.value = '';
    expandedMatches.value = [];
    return;
  }
  const res = await getFolloweeEnrolledMatch(row.fuid);
  dialogVisible.value = true;
  expandedUid.value = row.fuid;
  expandedNickname.value = row.nickname;
  expandedMatches.value = res.data?.enrolledMatchList || [];
}

async function cancelFollow(row) {
  try {
    await ElMessageBox.confirm('确认要取消关注吗？', '提示', { type: 'warning' });
  } catch {
    return;
  }
  await goCancelFolloweeByUid(row.fuid);
  rows.value = rows.value.filter((v) => v.fuid !== row.fuid);
  const followees = rows.value.map((item) => item.fuid);
  localStorage.setItem('userFollowees', JSON.stringify(followees));
  if (expandedUid.value === row.fuid) {
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

/* 手机端布局 */
.following-mobile {
  padding: 8px;
}

.following-header {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 0 4px;
}

.following-empty {
  text-align: center;
  color: #6b7280;
  padding: 40px 0;
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.following-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.following-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.following-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.following-text {
  flex: 1;
  min-width: 0;
}

.following-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.following-expand-hint {
  font-size: 12px;
  color: #409eff;
  margin-top: 4px;
}

.following-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.following-actions .el-button {
  width: 90px;
}

.following-expanded {
  padding: 0 12px 12px;
  border-top: 1px solid #f0f0f0;
}

.following-expanded-title {
  font-size: 13px;
  color: #6b7280;
  padding: 10px 0 8px;
}

.following-loading {
  height: 100px;
}
</style>
