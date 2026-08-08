<template>
  <div v-if="ttDetailGames.length" class="results-tt-detail">
    <div class="results-detail-toggle" @click="showTtDetail = !showTtDetail">
      {{ showTtDetail ? '隐藏' : '显示' }}淘汰赛详细成绩
    </div>
    <template v-if="showTtDetail">
      <div v-for="info in ttDetailGames" :key="info.tgameid" class="results-detail-round">
        <div class="results-detail-round-name">{{ info.roundname }}</div>
        <div class="results-detail-table-wrap">
          <el-table
            v-if="info.games?.length"
            :data="info.games"
            border
            class="results-detail-table"
            :cell-style="setDetailCellStyle"
            :header-cell-style="setResultHeaderStyle"
            size="small"
          >
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column prop="username1" label="选手1" width="120" align="center">
              <template #default="scope">
                <div
                  class="results-detail-name"
                  :class="{ 'is-win': scope.row.result1 > scope.row.result2 }"
                >
                  {{ scope.row.username1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="username2" label="选手2" width="120" align="center">
              <template #default="scope">
                <div
                  class="results-detail-name"
                  :class="{ 'is-win': scope.row.result2 > scope.row.result1 }"
                >
                  {{ scope.row.username2 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="比分" width="80" align="center">
              <template #default="scope">
                <span>{{ `${scope.row.result1}:${scope.row.result2}` }}</span>
              </template>
            </el-table-column>
            <el-table-column label="详情" width="60" align="center">
              <template #default="scope">
                <el-icon
                  v-if="String(scope.row.flag) === '0'"
                  class="detail-icon"
                  @click="openKnockoutDetail(scope.row)"
                >
                  <ArrowRight />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </div>

  <MatchDetailDialog
    v-model:visible="dialogVisible"
    :gameid="currentGameid"
    @open-match="openMatch"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { getGameidByUIDAndMatchItem } from '@/api/match';
import MatchDetailDialog from '../MatchDetailDialog.vue';

const props = defineProps({
  ttDetailGames: {
    type: Array,
    default: () => [],
  },
  eventId: {
    type: [String, Number],
    default: '',
  },
  itemId: {
    type: [String, Number],
    default: '',
  },
});

const showTtDetail = ref(false);
const dialogVisible = ref(false);
const currentGameid = ref('');
const resolving = ref(false);

const openMatch = (gameid) => {
  currentGameid.value = gameid;
  dialogVisible.value = true;
};

const openKnockoutDetail = async (game) => {
  if (!props.eventId || !props.itemId || !game.uid1 || !game.uid2) return;
  if (resolving.value) return;
  resolving.value = true;
  try {
    const res = await getGameidByUIDAndMatchItem({
      eventid: props.eventId,
      itemid: props.itemId,
      uid1: game.uid1,
      uid2: game.uid2,
    });
    const gameid = res.data?.gameid;
    if (gameid) {
      openMatch(gameid);
    }
  } finally {
    resolving.value = false;
  }
};

function setResultHeaderStyle() {
  return {
    fontSize: '11px',
    padding: '4px 2px',
  };
}

function setDetailCellStyle() {
  return {
    fontSize: '11px',
    padding: '4px 2px',
    background: '#F2F0F2',
    height: '28px',
  };
}
</script>

<style scoped>
.results-tt-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-detail-toggle {
  background: #fffb85;
  border: 1px solid #77b980;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.results-detail-round {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.results-detail-round-name {
  border: 1px solid #f89703;
  color: #f89703;
  padding: 2px 16px;
  font-size: 12px;
}

.results-detail-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.results-detail-table {
  width: 420px;
}

.results-detail-name {
  white-space: normal;
  line-height: 1.4;
}

.results-detail-name.is-win {
  color: #f89703;
  font-weight: 600;
}

.score-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.score-link:hover {
  text-decoration: underline;
}

.detail-icon {
  cursor: pointer;
  color: #409eff;
}

.detail-icon:hover {
  color: #66b1ff;
}
</style>
