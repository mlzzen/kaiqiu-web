<template>
  <div class="event-detail" :class="{ 'mobile': isMobile }">
    <EventDetailHeader
      :loading="loading"
      :detail="detail"
      :sub-event-list="subEventList"
      :active-item-id="activeItemId"
      :current-item="currentItem"
      :all-count="allCount"
      @open-members="openMembers"
      @update:active-item-id="activeItemId = $event"
    />

    <el-card class="event-tabs-card">
      <el-tabs v-model="activeTab" @tab-change="loadTabData" :class="{ 'mobile': isMobile }">
        <el-tab-pane label="赛程" name="groups" />
        <el-tab-pane label="成绩" name="results" />
        <el-tab-pane label="名次" name="honors" />
        <el-tab-pane label="积分变化" name="score" />
      </el-tabs>

      <ScheduleTab
        v-if="activeTab === 'groups'"
        :loading="tabLoading"
        :group-sections="groupSections"
        :current-item="currentItem"
        @go-set-score="goSetScore"
      />

      <ResultsTab
        v-else-if="activeTab === 'results'"
        :loading="tabLoading"
        :result-groups="resultGroups"
        :result-honors="resultHonors"
        :result-tt-games="resultTtGames"
        :result-tt-detail-games="resultTtDetailGames"
        :result-init="resultInit"
        :current-item="currentItem"
      />

      <HonorsTab
        v-else-if="activeTab === 'honors'"
        :loading="tabLoading"
        :honor-rows="honorRows"
      />

      <ScoreTab
        v-else
        :loading="tabLoading"
        :score-rows="scoreRows"
      />
    </el-card>

    <EventInfoCard :detail-html="detailHtml" />

    <MemberDrawer
      v-model="memberVisible"
      :members="memberRows"
      :loading="memberLoading"
      @refresh="loadMemberDetail"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllHonors, getAllResult, getEventDetaiByIdAndLocation, getGroups, getMemberDetail, getScoreChangeByEventid } from '../api/event';
import { useUserStore } from '../stores/user';
import EventDetailHeader from '../components/event-detail/EventDetailHeader.vue';
import ScheduleTab from '../components/event-detail/ScheduleTab.vue';
import ResultsTab from '../components/event-detail/ResultsTab.vue';
import HonorsTab from '../components/event-detail/HonorsTab.vue';
import ScoreTab from '../components/event-detail/ScoreTab.vue';
import EventInfoCard from '../components/event-detail/EventInfoCard.vue';
import MemberDrawer from '../components/MemberDrawer.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

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

const loading = ref(false);
const tabLoading = ref(false);
const memberLoading = ref(false);

const detail = ref({});
const subEventList = ref([]);
const activeItemId = ref(null);
const activeTab = ref('groups');

const groupSections = ref([]);
const resultGroups = ref([]);
const resultHonors = ref([]);
const resultTtGames = ref([]);
const resultTtDetailGames = ref([]);
const resultInit = ref(false);
const honorRows = ref([]);
const scoreRows = ref([]);

const memberVisible = ref(false);
const memberRows = ref([]);

const eventId = computed(() => route.params.id);
const currentItem = computed(
  () => subEventList.value.find((v) => String(v.id) === String(activeItemId.value)) || null,
);
const allCount = computed(() => {
  if (!currentItem.value) {
    return '-';
  }
  const num = Number(currentItem.value.count || 0) - Number(currentItem.value.sub_count || 0);
  return Number.isNaN(num) ? '-' : num;
});
const detailHtml = computed(() => {
  try {
    return decodeURIComponent(detail.value?.detail || '');
  } catch {
    return detail.value?.detail || '';
  }
});

async function loadDetail() {
  loading.value = true;
  try {
    const { lng, lat } = userStore.location;
    const res = await getEventDetaiByIdAndLocation({ id: eventId.value, lng, lat });
    detail.value = res.data?.detail || {};
    subEventList.value = res.data?.items || [];
    if (!activeItemId.value && subEventList.value.length) {
      activeItemId.value = subEventList.value[0].id;
    }
  } finally {
    loading.value = false;
  }
}

async function loadTabData() {
  if (!activeItemId.value) {
    return;
  }
  tabLoading.value = true;
  try {
    if (activeTab.value === 'groups') {
      groupSections.value = [];
      const res = await getGroups({ eventid: eventId.value, itemid: activeItemId.value });
      const groups =
        res.data?.[activeItemId.value]?.groups ||
        res.data?.[String(activeItemId.value)]?.groups ||
        [];
      groupSections.value = groups;
      return;
    }

    if (activeTab.value === 'results') {
      resultInit.value = false;
      resultGroups.value = [];
      resultHonors.value = [];
      resultTtGames.value = [];
      resultTtDetailGames.value = [];
      const [resultRes, honorsRes] = await Promise.all([
        getAllResult({ eventid: eventId.value, itemid: activeItemId.value }),
        getAllHonors({ eventid: eventId.value }),
      ]);
      if (resultRes.data) {
        resultGroups.value =
          resultRes.data.groups?.[activeItemId.value] ||
          resultRes.data.groups?.[String(activeItemId.value)] ||
          [];
        resultTtGames.value =
          resultRes.data.ttgames?.[activeItemId.value] ||
          resultRes.data.ttgames?.[String(activeItemId.value)] ||
          [];
        resultTtDetailGames.value =
          resultRes.data.ttdetailgames?.[activeItemId.value] ||
          resultRes.data.ttdetailgames?.[String(activeItemId.value)] ||
          [];
      }
      if (honorsRes.data) {
        resultHonors.value =
          honorsRes.data[activeItemId.value] ||
          honorsRes.data[String(activeItemId.value)] ||
          [];
      }
      resultInit.value = true;
      return;
    }

    if (activeTab.value === 'honors') {
      const res = await getAllHonors({ eventid: eventId.value });
      honorRows.value = res.data?.[activeItemId.value] || res.data?.[String(activeItemId.value)] || [];
      return;
    }

    const res = await getScoreChangeByEventid(eventId.value);
    scoreRows.value =
      res.data?.sc?.[activeItemId.value] || res.data?.sc?.[String(activeItemId.value)] || [];
  } finally {
    tabLoading.value = false;
  }
}

function goSetScore() {
  if (!activeItemId.value) {
    return;
  }
  router.push(`/set-score/group/${eventId.value}/${activeItemId.value}`);
}

function openMembers() {
  memberVisible.value = true;
}

async function loadMemberDetail() {
  if (!currentItem.value || !detail.value.eventid) {
    return;
  }
  memberLoading.value = true;
  try {
    const res = await getMemberDetail({ match_id: detail.value.eventid, id: currentItem.value.id });
    memberRows.value = res.data?.list || [];
  } finally {
    memberLoading.value = false;
  }
}

watch(
  eventId,
  async () => {
    activeItemId.value = null;
    activeTab.value = 'groups';
    groupSections.value = [];
    resultGroups.value = [];
    resultHonors.value = [];
    resultTtGames.value = [];
    resultTtDetailGames.value = [];
    resultInit.value = false;
    memberRows.value = [];
    await loadDetail();
    await loadTabData();
    await loadMemberDetail();
  },
  { immediate: true },
);

watch(activeItemId, () => {
  loadTabData();
  loadMemberDetail();
});
</script>

<style scoped>
.event-detail.mobile {
  padding: 4px;
}

.event-detail.mobile .event-tabs-card {
  margin-top: 8px;
}

.event-detail.mobile :deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 12px;
}
</style>
