<template>
  <el-container class="layout">
    <!-- 桌面端 Header -->
    <el-header class="header" v-if="!isMobile">
      <div class="brand">开球网 PC 版</div>
      <el-menu mode="horizontal" :default-active="activePath" @select="toPath" class="menu">
        <el-menu-item index="/home">首页赛事</el-menu-item>
        <el-menu-item index="/search">搜索</el-menu-item>
        <el-menu-item index="/ranking">排行榜</el-menu-item>
        <el-menu-item index="/profile">我的</el-menu-item>
      </el-menu>
      <div class="right">
        <el-select
          v-model="cityName"
          filterable
          placeholder="选择城市"
          @change="onCityChange"
          style="width: 160px"
        >
          <el-option
            v-for="item in cityOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
        <el-dropdown>
          <span class="user">{{ userStore.userInfo?.username || '未登录用户' }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="toPath('/profile')">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click="doLogout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main" :class="{ mobile: isMobile }">
      <router-view />
    </el-main>

    <!-- 手机端底部 Tabbar -->
    <div class="tabbar" v-if="isMobile">
      <div class="tab-item" :class="{ active: activeTab === '/home' }" @click="toPath('/home')">
        <span class="tab-icon">🏠</span>
        <span class="tab-label">首页</span>
      </div>
      <div class="tab-item" :class="{ active: activeTab === '/search' }" @click="toPath('/search')">
        <span class="tab-icon">🔍</span>
        <span class="tab-label">搜索</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === '/profile' }"
        @click="toPath('/profile')"
      >
        <span class="tab-icon">👤</span>
        <span class="tab-label">我的</span>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';
import { getCities } from '../api/publicc';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cityOptions = ref([{ id: userStore.city.id, name: userStore.city.name }]);
const cityName = ref(userStore.city.name);
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

const activePath = computed(() => {
  if (route.path.startsWith('/event')) {
    return '/home';
  }
  if (route.path.startsWith('/user') || route.path.startsWith('/following')) {
    return '/profile';
  }
  return route.path;
});

const activeTab = computed(() => {
  if (route.path.startsWith('/home')) return '/home';
  if (route.path.startsWith('/search')) return '/search';
  if (
    route.path.startsWith('/profile') ||
    route.path.startsWith('/user') ||
    route.path.startsWith('/following')
  )
    return '/profile';
  return '/home';
});

function toPath(path) {
  router.push(path);
}

function doLogout() {
  userStore.logout();
  ElMessage.success('已退出');
  router.replace('/login');
}

function onCityChange(value) {
  const found = cityOptions.value.find((v) => v.name === value);
  if (found) {
    userStore.setCity(found);
  }
}

onMounted(async () => {
  try {
    const res = await getCities();
    const rows = res.data?.data || [];
    if (rows.length) {
      cityOptions.value = rows;
      if (!rows.some((v) => v.name === cityName.value)) {
        cityName.value = rows[0].name;
        userStore.setCity(rows[0]);
      }
    }
  } catch {
    // ignore
  }
});
</script>

<style scoped>
.el-main {
  --el-main-padding: 8px;
}

.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(8px);
}

.brand {
  font-size: 22px;
  font-weight: 700;
  color: #2f4d32;
  min-width: 160px;
}

.menu {
  flex: 1;
  border-bottom: 0;
  background: transparent;
}

.right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user {
  cursor: pointer;
  color: #374151;
}

.main {
  width: 100%;
}

.main.mobile {
  --el-main-padding: 4px;
  padding-bottom: 60px;
}

/* 手机端底部 Tabbar */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 16px;
  cursor: pointer;
  color: #6b7280;
}

.tab-item.active {
  color: #2f4d32;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: 11px;
}
</style>
