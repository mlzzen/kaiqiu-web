<template>
  <!-- 手机端布局 -->
  <div class="mobile-layout" v-if="isMobile">
    <!-- 1. 头像、名称、全国排名、积分信息 -->
    <el-card class="mobile-card">
      <div class="profile">
        <el-avatar :size="90" :src="profile.realpic || profile.image" />
        <div class="name">{{ profile.realname || '-' }}</div>
        <div class="sub">{{ profile.username || '-' }}</div>
        <div class="meta">{{ profile.scope || '全国' }}排名: {{ profile.rank ?? '-' }}</div>
        <div class="score-row">
          <div class="score-item">
            <div class="score-label">当前积分</div>
            <div class="score-value">{{ profile.score ?? '-' }}</div>
          </div>
          <div class="score-item">
            <div class="score-label">年度积分</div>
            <div class="score-value">{{ profile.maxScoreTheYear ?? '-' }}</div>
          </div>
          <div class="score-item">
            <div class="score-label">最高积分</div>
            <div class="score-value">{{ profile.maxscore ?? '-' }}</div>
          </div>
        </div>
        <el-button type="success" plain @click="toggleFollow" v-if="showFollowButton">
          {{ Number(profile.hasFollowed) === 1 ? '取消关注' : '关注Ta' }}
        </el-button>
      </div>
    </el-card>

    <!-- 2. 最近40场比赛积分趋势 -->
    <el-card class="mobile-card" v-if="scoreTrend.length">
      <div class="section-title">最近40场比赛积分趋势</div>
      <div ref="mobileChartRef" class="trend-chart"></div>
    </el-card>

    <!-- 3. 比赛信息 -->
    <el-card class="mobile-card" v-if="profile.description">
      <div class="section-title">比赛信息</div>
      <div class="html" v-html="safeDescription"></div>
    </el-card>

    <!-- 4. 基础信息 -->
    <el-card class="mobile-card">
      <div class="section-title">基础信息</div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="性别年龄">
          {{ profile.sex || '-' }}{{ profile.age ? ` ${profile.age}岁` : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="所在">{{ profile.resideprovince || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业背景">{{ profile.bg || '-' }}</el-descriptions-item>
        <el-descriptions-item label="底板型号">{{ `${profile.qiupai || ''} ${profile.qiupaitype || ''}`.trim() || '-' }}</el-descriptions-item>
        <el-descriptions-item label="正手套胶">{{ `${profile.zhengshou || ''} ${profile.zhengshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
        <el-descriptions-item label="反手套胶">{{ `${profile.fanshou || ''} ${profile.fanshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 5. 战胜的前三名那一块 -->
    <el-card class="mobile-card">
      <template v-if="top3BeatList.length">
        <div class="section-title">击败分数最高前三名</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in top3BeatList" :key="`top3-beat-${index}`">
            <UserLink :uid="item.uid" :name="item.name" />
          </div>
        </div>
      </template>
      <template v-if="top3PlayerList.length">
        <div class="section-title">交手分数最高前三名</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in top3PlayerList" :key="`top3-player-${index}`">
            <UserLink :uid="item.uid" :name="item.name" />
          </div>
        </div>
      </template>
      <template v-if="top3BeatManList.length">
        <div class="section-title">击败男子最高前三名</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in top3BeatManList" :key="`top3-man-${index}`">
            <UserLink :uid="item.uid" :name="item.name" />
          </div>
        </div>
      </template>
      <template v-if="top3BeatWomanList.length">
        <div class="section-title">击败女子最高前三名</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in top3BeatWomanList" :key="`top3-woman-${index}`">
            <UserLink :uid="item.uid" :name="item.name" />
          </div>
        </div>
      </template>
      <template v-if="kuZhuList.length">
        <div class="section-title">苦主</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in kuZhuList" :key="`kuzhu-${index}`">
            <UserLink :uid="item.uid" :name="`${item.name}(${item.score || '-'})`" />
            <span class="sub">{{ item.detail }}</span>
          </div>
        </div>
      </template>
      <template v-if="fuXingList.length">
        <div class="section-title">福星</div>
        <div class="stat-list">
          <div class="stat-item" v-for="(item, index) in fuXingList" :key="`fuxing-${index}`">
            <UserLink :uid="item.uid" :name="`${item.name}(${item.score || '-'})`" />
            <span class="sub">{{ item.detail }}</span>
          </div>
        </div>
      </template>
      <template v-if="oftenPlayerList.length">
        <div class="section-title">经常交手</div>
        <div class="tag-list">
          <el-tag v-for="(item, index) in oftenPlayerList" :key="`often-${index}`" effect="plain">{{ item }}</el-tag>
        </div>
      </template>
      <template v-if="allCitiesList.length">
        <div class="section-title">曾参加比赛城市</div>
        <div class="tag-list">
          <el-tag v-for="(city, index) in allCitiesList" :key="`city-${index}`" type="info" effect="plain">{{ city }}</el-tag>
        </div>
      </template>
      <template v-if="showTags.length">
        <div class="section-title">收到最多评价</div>
        <div class="tag-list">
          <el-tag v-for="tag in showTags" :key="`${tag.ename}-${tag.etype}`" :type="tag.selected == 1 ? 'success' : 'info'" effect="plain" class="tag-item">{{ tag.ename }} ({{ tag.count }})</el-tag>
        </div>
      </template>
      <template v-if="profile.honors?.length">
        <div class="section-title">近期荣耀</div>
        <div class="honor-list">
          <div class="honor-item" v-for="(item, index) in profile.honors" :key="index">
            <img class="honor-icon" :src="item.honor" alt="honor" />
            <EventLink :event-id="item.eventid" :name="item.subject" />
          </div>
        </div>
      </template>
    </el-card>

    <!-- 6. 近期战绩 -->
    <el-card class="mobile-card">
      <div class="section-title">近期战绩</div>
      <el-table :data="games" stripe v-loading="gamesLoading" size="small">
        <el-table-column label="#" type="index" width="25" />
        <el-table-column label="日期" width="80">
          <template #default="scope">
            <EventLink v-if="getEventId(scope.row)" :event-id="getEventId(scope.row)" :name="scope.row.dateline" />
            <span v-else>{{ scope.row.dateline }}</span>
          </template>
        </el-table-column>
        <el-table-column label="选手1" min-width="80">
          <template #default="scope">
            <UserLink :uid="scope.row.uid1" :name="scope.row.username1" />
          </template>
        </el-table-column>
        <el-table-column label="选手2" min-width="80">
          <template #default="scope">
            <UserLink :uid="scope.row.uid2" :name="scope.row.username2" />
          </template>
        </el-table-column>
        <el-table-column label="比分" width="35">
          <template #default="scope">
            <span :class="{ 'score-win': scope.row.result1 > scope.row.result2, 'score-lose': scope.row.result1 < scope.row.result2 }">
              {{ scope.row.result1 }}:{{ scope.row.result2 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变化" width="45">
          <template #default="scope">
            <span :class="{ 'score-win': Number(scope.row.score1) > 0, 'score-lose': Number(scope.row.score1) < 0 }">{{ scope.row.score1 }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-button :disabled="page <= 1 || gamesLoading" @click="prevPage" size="small">上一页</el-button>
        <span class="page-text">第 {{ page }} 页</span>
        <el-button :disabled="!hasNext || gamesLoading" @click="nextPage" size="small">下一页</el-button>
      </div>
    </el-card>
  </div>

  <!-- 桌面端布局 -->
  <el-row :gutter="16" v-else>
    <el-col :span="8">
      <div class="left-stack">
        <el-card>
          <div class="profile">
            <el-avatar :size="90" :src="profile.realpic || profile.image" />
            <div class="name">{{ profile.realname || '-' }}</div>
            <div class="sub">{{ profile.username || '-' }}</div>
            <div class="meta">{{ profile.scope || '全国' }}排名: {{ profile.rank ?? '-' }}</div>
            <div class="score-row">
              <div class="score-item">
                <div class="score-label">当前积分</div>
                <div class="score-value">{{ profile.score ?? '-' }}</div>
              </div>
              <div class="score-item">
                <div class="score-label">年度积分</div>
                <div class="score-value">{{ profile.maxScoreTheYear ?? '-' }}</div>
              </div>
              <div class="score-item">
                <div class="score-label">最高积分</div>
                <div class="score-value">{{ profile.maxscore ?? '-' }}</div>
              </div>
            </div>
            <el-button type="success" plain @click="toggleFollow" v-if="showFollowButton">
              {{ Number(profile.hasFollowed) === 1 ? '取消关注' : '关注Ta' }}
            </el-button>
          </div>
        </el-card>

        <el-card>
          <template v-if="profile.description">
            <div class="section-title">比赛信息</div>
            <div class="html" v-html="safeDescription"></div>
          </template>

          <template v-if="showTags.length">
            <div class="section-title">收到最多评价</div>
            <div class="tag-list">
              <el-tag v-for="tag in showTags" :key="`${tag.ename}-${tag.etype}`" :type="tag.selected == 1 ? 'success' : 'info'" effect="plain" class="tag-item">{{ tag.ename }} ({{ tag.count }})</el-tag>
            </div>
          </template>

          <div class="section-title">基础信息</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="性别年龄">
              {{ profile.sex || '-' }}{{ profile.age ? ` ${profile.age}岁` : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="所在">{{ profile.resideprovince || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业背景">{{ profile.bg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="底板型号">{{ `${profile.qiupai || ''} ${profile.qiupaitype || ''}`.trim() || '-' }}</el-descriptions-item>
            <el-descriptions-item label="正手套胶">{{ `${profile.zhengshou || ''} ${profile.zhengshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
            <el-descriptions-item label="反手套胶">{{ `${profile.fanshou || ''} ${profile.fanshoutype || ''}`.trim() || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-col>

    <el-col :span="16">
      <el-card>
        <template v-if="scoreTrend.length">
          <div class="section-title">最近40场比赛积分趋势</div>
          <div ref="desktopChartRef" class="trend-chart"></div>
        </template>

        <template v-if="top3BeatList.length">
          <div class="section-title">击败分数最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatList" :key="`top3-beat-${index}`">
              <UserLink :uid="item.uid" :name="item.name" />
            </div>
          </div>
        </template>

        <template v-if="top3PlayerList.length">
          <div class="section-title">交手分数最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3PlayerList" :key="`top3-player-${index}`">
              <UserLink :uid="item.uid" :name="item.name" />
            </div>
          </div>
        </template>

        <template v-if="top3BeatManList.length">
          <div class="section-title">击败男子最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatManList" :key="`top3-man-${index}`">
              <UserLink :uid="item.uid" :name="item.name" />
            </div>
          </div>
        </template>

        <template v-if="top3BeatWomanList.length">
          <div class="section-title">击败女子最高前三名</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in top3BeatWomanList" :key="`top3-woman-${index}`">
              <UserLink :uid="item.uid" :name="item.name" />
            </div>
          </div>
        </template>

        <template v-if="kuZhuList.length">
          <div class="section-title">苦主</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in kuZhuList" :key="`kuzhu-${index}`">
              <UserLink :uid="item.uid" :name="`${item.name}(${item.score || '-'})`" />
              <span class="sub">{{ item.detail }}</span>
            </div>
          </div>
        </template>

        <template v-if="fuXingList.length">
          <div class="section-title">福星</div>
          <div class="stat-list">
            <div class="stat-item" v-for="(item, index) in fuXingList" :key="`fuxing-${index}`">
              <UserLink :uid="item.uid" :name="`${item.name}(${item.score || '-'})`" />
              <span class="sub">{{ item.detail }}</span>
            </div>
          </div>
        </template>

        <template v-if="oftenPlayerList.length">
          <div class="section-title">经常交手</div>
          <div class="tag-list">
            <el-tag v-for="(item, index) in oftenPlayerList" :key="`often-${index}`" effect="plain">{{ item }}</el-tag>
          </div>
        </template>

        <template v-if="allCitiesList.length">
          <div class="section-title">曾参加比赛城市</div>
          <div class="tag-list">
            <el-tag v-for="(city, index) in allCitiesList" :key="`city-${index}`" type="info" effect="plain">{{ city }}</el-tag>
          </div>
        </template>

        <template v-if="profile.honors?.length">
          <div class="section-title">近期荣耀</div>
          <div class="honor-list">
            <div class="honor-item" v-for="(item, index) in profile.honors" :key="index">
              <img class="honor-icon" :src="item.honor" alt="honor" />
              <EventLink :event-id="item.eventid" :name="item.subject" />
            </div>
          </div>
        </template>

        <div class="section-title">近期战绩</div>
        <el-table :data="games" stripe v-loading="gamesLoading">
          <el-table-column label="#" type="index" width="40" />
          <el-table-column label="日期" width="130">
            <template #default="scope">
              <EventLink v-if="getEventId(scope.row)" :event-id="getEventId(scope.row)" :name="scope.row.dateline" />
              <span v-else>{{ scope.row.dateline }}</span>
            </template>
          </el-table-column>
          <el-table-column label="选手1" min-width="140">
            <template #default="scope">
              <template v-if="scope.row.flag === '1'">
                <div class="doubles-player">
                  <UserLink :uid="scope.row.uid1" :name="scope.row.username1" />
                  <UserLink :uid="scope.row.uid11" :name="scope.row.username11" />
                </div>
              </template>
              <template v-else>
                <UserLink :uid="scope.row.uid1" :name="scope.row.username1" />
              </template>
            </template>
          </el-table-column>
          <el-table-column label="选手2" min-width="140">
            <template #default="scope">
              <template v-if="scope.row.flag === '1'">
                <div class="doubles-player">
                  <UserLink :uid="scope.row.uid2" :name="scope.row.username2" />
                  <UserLink :uid="scope.row.uid22" :name="scope.row.username22" />
                </div>
              </template>
              <template v-else>
                <UserLink :uid="scope.row.uid2" :name="scope.row.username2" />
              </template>
            </template>
          </el-table-column>
          <el-table-column label="比分" width="50">
            <template #default="scope">
              <span v-if="scope.row.gameid && scope.row.flag === '0'" class="score-link" @click="openMatch(scope.row.gameid)" :class="{ 'score-win': scope.row.result1 > scope.row.result2, 'score-lose': scope.row.result1 < scope.row.result2 }">
                {{ scope.row.result1 }}:{{ scope.row.result2 }}
              </span>
              <span v-else :class="{ 'score-win': scope.row.result1 > scope.row.result2, 'score-lose': scope.row.result1 < scope.row.result2 }">
                {{ scope.row.result1 }}:{{ scope.row.result2 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="变化" min-width="80">
            <template #default="scope">
              <span :class="{ 'score-win': Number(scope.row.score1) > 0, 'score-lose': Number(scope.row.score1) < 0 }">{{ scope.row.score1 }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pager">
          <el-button :disabled="page <= 1 || gamesLoading" @click="prevPage">上一页</el-button>
          <span class="page-text">第 {{ page }} 页</span>
          <el-button :disabled="!hasNext || gamesLoading" @click="nextPage">下一页</el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <MatchDetailDialog
    v-model:visible="dialogVisible"
    :gameid="currentGameid"
    @open-match="openMatch"
  />

  <!-- 积分趋势详情弹窗 -->
  <el-dialog
    v-model="showTrendDetail"
    :title="`${selectedTrendItem?.postscore || ''}分`"
    width="320px"
    destroy-on-close
  >
    <div v-if="selectedTrendItem" class="trend-detail">
      <div class="trend-detail-row">
        <span class="trend-detail-label">日期</span>
        <span class="trend-detail-value">{{ formatDate(selectedTrendItem.dateline) }}</span>
      </div>
      <div class="trend-detail-row">
        <span class="trend-detail-label">地点</span>
        <span class="trend-detail-value">{{ selectedTrendItem.province || '' }}{{ selectedTrendItem.city || '' }}</span>
      </div>
      <div class="trend-detail-row">
        <span class="trend-detail-label">比赛</span>
        <span class="trend-detail-value">{{ selectedTrendItem.title || '-' }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import UserLink from '../components/UserLink.vue';
import EventLink from '../components/EventLink.vue';
import MatchDetailDialog from '../components/MatchDetailDialog.vue';
import {
  getAdvProfile,
  getPageGamesByUid,
  getUserScores,
  getUserTags,
  goCancelFolloweeByUid,
  goFolloweeByUid,
} from '../api/user';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const profile = ref({});
const games = ref([]);
const gamesLoading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const firstPageGames = ref([]);
const hasNext = ref(false);
const effectivePageSize = ref(20);
const showTags = ref([]);
const scoreTrend = ref([]);
const dialogVisible = ref(false);
const currentGameid = ref('');
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);
const mobileChartRef = ref(null);
const desktopChartRef = ref(null);
let mobileChart = null;
let desktopChart = null;
const selectedTrendItem = ref(null);
const showTrendDetail = ref(false);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
  resizeCharts();
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth);
  if (mobileChart) {
    mobileChart.dispose();
  }
  if (desktopChart) {
    desktopChart.dispose();
  }
});

function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return dateStr;
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

function buildChartOption(data) {
  const dates = data.map((v) => formatDate(v.dateline));
  const scores = data.map((v) => Number(v.postscore || 0));

  // 计算积分范围，让 y 轴聚焦在变化区间
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const padding = Math.max(Math.round((maxScore - minScore) * 0.15), 10);
  const yMin = Math.max(0, minScore - padding);
  const yMax = maxScore + padding;

  return {
    tooltip: {
      trigger: 'item',
      triggerOn: isMobile.value ? 'click' : 'mousemove',
      formatter: (params) => {
        const item = data[params.dataIndex];
        return `
          <div style="padding: 4px;">
            <div><strong>${item.postscore}分</strong></div>
            <div style="color:#666;font-size:12px;">${formatDate(item.dateline)}</div>
            <div style="color:#666;font-size:12px;">${item.province || ''}${item.city || ''}</div>
            <div style="color:#666;font-size:12px;max-width:200px;word-break:break-all;">${item.title || ''}</div>
          </div>
        `;
      },
    },
    grid: {
      left: isMobile.value ? 50 : 55,
      right: isMobile.value ? 15 : 20,
      top: isMobile.value ? 35 : 25,
      bottom: isMobile.value ? 35 : 40,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: isMobile.value ? 10 : 12,
        rotate: isMobile.value ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        fontSize: isMobile.value ? 10 : 12,
      },
    },
    series: [
      {
        data: scores,
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: isMobile.value ? 12 : 8,
        lineStyle: {
          width: 2,
          color: '#248dff',
        },
        itemStyle: {
          color: '#248dff',
        },
        emphasis: {
          scale: true,
          focus: 'series',
          lineStyle: {
            width: 3,
          },
        },
      },
    ],
  };
}

function initCharts() {
  if (scoreTrend.value.length === 0) return;

  const option = buildChartOption(scoreTrend.value);

  if (isMobile.value && mobileChartRef.value) {
    if (!mobileChart) {
      mobileChart = echarts.init(mobileChartRef.value);
      mobileChart.on('click', onChartClick);
    }
    mobileChart.setOption(option);
  }

  if (!isMobile.value && desktopChartRef.value) {
    if (!desktopChart) {
      desktopChart = echarts.init(desktopChartRef.value);
      desktopChart.on('click', onChartClick);
    }
    desktopChart.setOption(option);
  }
}

function resizeCharts() {
  if (mobileChart) {
    mobileChart.resize();
  }
  if (desktopChart) {
    desktopChart.resize();
  }
}

function onChartClick(params) {
  if (params.componentType === 'series') {
    const index = params.dataIndex;
    if (index >= 0 && index < scoreTrend.value.length) {
      selectedTrendItem.value = scoreTrend.value[index];
      showTrendDetail.value = true;
    }
  }
}

watch(windowWidth, () => {
  resizeCharts();
});

watch(scoreTrend, () => {
  nextTick(() => {
    initCharts();
  });
}, { deep: true });

watch(isMobile, () => {
  nextTick(() => {
    if (desktopChart) {
      desktopChart.dispose();
      desktopChart = null;
    }
    if (mobileChart) {
      mobileChart.dispose();
      mobileChart = null;
    }
    initCharts();
  });
});

const openMatch = (gameid) => {
  currentGameid.value = gameid;
  dialogVisible.value = true;
};

const uid = computed(
  () => route.params.uid || userStore.userInfo?.user_id || userStore.userInfo?.id,
);
const showFollowButton = computed(() => Number(profile.value.hasFollowed) !== -1);
const safeDescription = computed(() => {
  try {
    return decodeURIComponent(profile.value.description || '');
  } catch {
    return profile.value.description || '';
  }
});
const oftenPlayerList = computed(() => splitValue(profile.value.OftenPlayer));
const top3BeatList = computed(() =>
  parseTopList(profile.value.Top3OfBeat, profile.value.Top3OfBeatUsernameScore),
);
const top3PlayerList = computed(() =>
  parseTopList(profile.value.TopPlayer, profile.value.TopPlayerUsernameScore),
);
const top3BeatManList = computed(() =>
  parseTopList(profile.value.Top3ManOfBeat, profile.value.Top3ManOfBeatUsernameScore),
);
const top3BeatWomanList = computed(() =>
  parseTopList(profile.value.Top3WomanOfBeat, profile.value.Top3WomanOfBeatUsernameScore),
);
const allCitiesList = computed(() => splitValue(profile.value.allCities));
const kuZhuList = computed(() => parseSpecialRival(profile.value.kuzhu));
const fuXingList = computed(() => parseSpecialRival(profile.value.fuxing));

async function loadData() {
  if (!uid.value) {
    return;
  }
  const res = await getAdvProfile(uid.value);
  profile.value = res.data || {};
  firstPageGames.value = res.data?.games?.data || [];
  effectivePageSize.value =
    firstPageGames.value.length > 0 ? firstPageGames.value.length : pageSize;
  total.value = Number(
    res.data?.games?.total || res.data?.games?.count || res.data?.games?.recordsTotal || 0,
  );
  // 原版是无限加载：未知总数时先允许继续翻页，直到某页返回空/不足再收口
  hasNext.value =
    total.value > 0 ? effectivePageSize.value < total.value : firstPageGames.value.length > 0;
  await Promise.all([loadUserTags(), loadUserScores()]);
  await loadGames(1);
}

async function loadUserTags() {
  if (!uid.value) {
    return;
  }
  const res = await getUserTags({ uid: uid.value, limitByCount: 6, getNegative: false });
  showTags.value = (res.data || []).filter((v) => Number(v.count || 0) > 0);
}

async function loadUserScores() {
  if (!uid.value) {
    return;
  }
  const res = await getUserScores(uid.value);
  scoreTrend.value = (res.data || []).slice(-40);
}

async function loadGames(nextPage = 1) {
  if (!uid.value) {
    return;
  }
  page.value = nextPage;
  gamesLoading.value = true;
  try {
    if (nextPage === 1) {
      games.value = firstPageGames.value;
      hasNext.value =
        total.value > 0 ? effectivePageSize.value < total.value : firstPageGames.value.length > 0;
      return;
    }
    const res = await getPageGamesByUid(uid.value, nextPage);
    const rows = res.data?.data || [];
    games.value = rows;
    const remoteTotal = Number(res.data?.total || res.data?.count || 0);
    if (remoteTotal > 0) {
      total.value = remoteTotal;
      hasNext.value = nextPage * effectivePageSize.value < remoteTotal;
    } else if (rows.length < effectivePageSize.value) {
      total.value = Math.max(total.value, (nextPage - 1) * effectivePageSize.value + rows.length);
      hasNext.value = false;
    } else {
      // 后端未返回总数时，按“可能还有下一页”维持可翻页
      total.value = Math.max(total.value, nextPage * effectivePageSize.value + 1);
      hasNext.value = true;
    }
  } finally {
    gamesLoading.value = false;
  }
}

async function toggleFollow() {
  if (Number(profile.value.hasFollowed) === 1) {
    try {
      await ElMessageBox.confirm('确认取消关注？', '提示', { type: 'warning' });
    } catch {
      return;
    }
    await goCancelFolloweeByUid(profile.value.uid);
    profile.value.hasFollowed = 0;
    return;
  }
  await goFolloweeByUid(profile.value.uid);
  profile.value.hasFollowed = 1;
}

watch(uid, () => loadData(), { immediate: true });

function getEventId(row) {
  return row?.eventid || row?.match_id || row?.id || null;
}

function goEvent(row) {
  const eventId = getEventId(row);
  if (!eventId) {
    return;
  }
  router.push(`/event/${eventId}`);
}

function prevPage() {
  if (page.value <= 1) {
    return;
  }
  loadGames(page.value - 1);
}

function nextPage() {
  if (!hasNext.value) {
    return;
  }
  loadGames(page.value + 1);
}

function splitValue(raw, delimiter = ',') {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v || '').trim()).filter(Boolean);
  }
  return String(raw || '')
    .split(delimiter)
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseTopList(uids, names) {
  const uidList = splitValue(uids).reverse();
  const nameList = splitValue(names);
  return nameList
    .map((name, index) => ({
      uid: uidList[index] || '',
      name: name || '',
    }))
    .filter((item) => item.name);
}

function parseSpecialRival(raw) {
  return String(raw || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const parts = item.split(',');
      return {
        name: parts[1] || '',
        score: parts[2] || '',
        uid: parts[3] || '',
        detail: parts[5] || '',
      };
    })
    .filter((item) => item.name);
}
</script>

<style scoped>
.left-stack {
  display: grid;
  gap: 16px;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.name {
  font-size: 20px;
  font-weight: 700;
}

.sub,
.meta {
  color: #6b7280;
}

.header {
  font-weight: 700;
}

.score-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 12px;
  color: #6b7280;
}

.score-value {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-title {
  margin: 16px 0 10px;
  font-weight: 700;
}

.trend-chart {
  width: 100%;
  height: 280px;
}

.trend-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-detail-row {
  display: flex;
  gap: 12px;
}

.trend-detail-label {
  color: #6b7280;
  flex-shrink: 0;
}

.trend-detail-value {
  color: #374151;
  word-break: break-all;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.honor-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.honor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.honor-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.html {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #374151;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-text {
  min-width: 72px;
  text-align: center;
  color: #6b7280;
}

.stat-list {
  display: grid;
  gap: 8px;
}

.stat-item {
  display: flex;
  gap: 8px;
  color: #374151;
}

.doubles-player {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.3;
}

.score-win {
  color: #ef4444 !important;
  font-weight: 400;
}

.score-lose {
  color: inherit;
  font-weight: 400;
}

.clickable-text {
  cursor: pointer;
}

.score-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

/* 手机端布局 */
.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

.mobile-card {
  width: 100%;
  flex-shrink: 0;
}

.mobile-card :deep(.el-card__body) {
  padding-bottom: 10px;
}

.mobile-card :deep(.el-table td),
.mobile-card :deep(.el-table th) {
  padding: 4px 0;
}

.mobile-card :deep(.el-table .cell) {
  padding: 0 4px;
}

.mobile-card :deep(.el-table__row) {
  height: 32px;
}

.mobile-card .profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mobile-card .score-row {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.mobile-card .score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-card .score-label {
  font-size: 12px;
  color: #6b7280;
}

.mobile-card .score-value {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.mobile-card .section-title {
  margin: 12px 0 8px;
  font-weight: 700;
  font-size: 14px;
}

.mobile-card .tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mobile-card .stat-list {
  display: grid;
  gap: 6px;
}

.mobile-card .stat-item {
  display: flex;
  gap: 8px;
  color: #374151;
  font-size: 14px;
}

.mobile-card .honor-list {
  display: grid;
  gap: 8px;
}

.mobile-card .honor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-card .html {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #374151;
  font-size: 14px;
}

@media (max-width: 767px) {
  .mobile-layout {
    width: 100%;
  }
}
</style>
