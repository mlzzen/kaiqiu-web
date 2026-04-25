<template>
  <el-card v-loading="loading" class="event-header" :class="{ mobile: isMobile }">
    <template #header>
      <div class="head">
        <div class="title-row">
          <div class="title">{{ detail.title || '赛事详情' }}</div>
          <div class="right-actions">
            <el-select
              :model-value="activeItemId"
              @update:model-value="$emit('update:activeItemId', $event)"
              placeholder="选择比赛分项"
              :style="isMobile ? 'width: 140px' : 'width: 300px'"
              size="small"
              v-if="isMobile"
            >
              <el-option
                v-for="item in subEventList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-if="!isMobile"
              :model-value="activeItemId"
              @update:model-value="$emit('update:activeItemId', $event)"
              placeholder="选择比赛分项"
              style="width: 300px"
            >
              <el-option
                v-for="item in subEventList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-button
              type="success"
              :disabled="!activeItemId"
              :size="isMobile ? 'small' : ''"
              @click="$emit('openMembers')"
            >
              参赛名单
            </el-button>
          </div>
        </div>
        <div v-if="detail.note" class="title-note">{{ detail.note }}</div>
      </div>
    </template>

    <el-descriptions :column="isMobile ? 1 : 2" border :size="isMobile ? 'small' : 'default'">
      <el-descriptions-item label="联系人">{{ detail.contact || '-' }}</el-descriptions-item>
      <el-descriptions-item label="电话">{{ detail.mobile || '-' }}</el-descriptions-item>
      <el-descriptions-item label="比赛时间"
        >{{ detail.starttime || '-' }} 至 {{ detail.endtime || '-' }}</el-descriptions-item
      >
      <el-descriptions-item label="比赛球馆">{{ detail.arena_name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="比赛地点" :span="isMobile ? 1 : 2">{{
        detail.location || '-'
      }}</el-descriptions-item>
    </el-descriptions>

    <div v-if="currentItem" class="item-info">
      <el-descriptions :column="isMobile ? 1 : 3" border :size="isMobile ? 'small' : 'default'">
        <el-descriptions-item label="项目名称">{{ currentItem.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报名人数"
          >{{ currentItem.curr_count || 0 }}/{{ allCount }}</el-descriptions-item
        >
        <el-descriptions-item label="比赛类型">{{
          currentItem.match_type || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="报名限制">{{
          currentItem.condition || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="报名费"
          >{{ currentItem.cost || 0 }} 元 {{ currentItem.postfee || '' }}</el-descriptions-item
        >
        <el-descriptions-item label="报名状态">{{
          currentItem.is_enter ? '已报名' : '未报名'
        }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  detail: {
    type: Object,
    default: () => ({}),
  },
  subEventList: {
    type: Array,
    default: () => [],
  },
  activeItemId: {
    type: [String, Number],
    default: null,
  },
  currentItem: {
    type: Object,
    default: null,
  },
  allCount: {
    type: [String, Number],
    default: '-',
  },
});

defineEmits(['openMembers', 'update:activeItemId']);

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

<style scoped lang="scss">
.head {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.event-header.mobile .title-row {
  flex-direction: column;
}

.right-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.event-header.mobile .right-actions {
  flex-wrap: wrap;
}

.event-header.mobile .title {
  font-size: 16px;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.title-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fffb85;
  border: 2px solid #f89703;
  border-radius: 6px;
  color: #d00;
  font-weight: 600;
  font-size: 14px;
}

.item-info {
  margin-top: 14px;
}

.event-header.mobile .item-info {
  margin-top: 10px;
}
</style>
