<template>
  <el-dialog
    v-model="dialogVisible"
    title="对战详情"
    width="90%"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <div class="match-detail">
      <!-- 选手对阵区域 -->
      <div class="players-section">
        <div class="player-info">
          <el-avatar :size="96" :src="currentGame.headImg1" />
          <div class="player-name">{{ currentGame.username1 }}({{ currentGame.realname1 }})</div>
          <div class="player-score">当前积分: {{ currentGame.score1 }}</div>
        </div>
        <div class="vs-text">vs</div>
        <div class="player-info">
          <el-avatar :size="96" :src="currentGame.headImg2" />
          <div class="player-name">{{ currentGame.username2 }}({{ currentGame.realname2 }})</div>
          <div class="player-score">当前积分: {{ currentGame.score2 }}</div>
        </div>
      </div>

      <!-- 本场数据 -->
      <div class="data-section">
        <div class="section-title">本场数据</div>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">{{ currentGame.start_time }}</span>
            <router-link
              v-if="currentGame.eventid"
              :to="`/event/${currentGame.eventid}`"
              class="event-link"
              @click="handleClose"
            >
              {{ currentGame.title }}
            </router-link>
            <span v-else>{{ currentGame.title }}</span>
          </div>

          <div class="info-row">
            <div class="score-label">
              本场比分({{ currentGame.groupid == '-1' ? '淘汰赛' : '小组赛' }})
            </div>
            <div class="score-display">
              <span class="score-num">{{ currentGame.result1 }}</span>
              <span class="score-sep">:</span>
              <span class="score-num">{{ currentGame.result2 }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="score-label">报名积分</div>
            <div class="score-display">
              <span class="score-small">{{ currentGame.before_score1 }}</span>
              <span class="score-sep">:</span>
              <span class="score-small">{{ currentGame.before_score2 }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="score-label">积分变化</div>
            <div class="score-display">
              <span class="change-score">{{ currentGame.change_score1 }}</span>
              <span class="score-sep">:</span>
              <span class="change-score">{{ currentGame.change_score2 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史交战记录 -->
      <div class="history-section">
        <div class="section-title">历史交战全记录</div>

        <div class="players-vs">
          <div class="player-info-small">
            <div class="player-name">{{ currentGame.username1 }}</div>
            <div>({{ currentGame.realname1 }})</div>
          </div>
          <div class="vs-score">
            <span class="win-count">{{ allInfo.winCount1 }}</span>
            <span class="sep">-</span>
            <span class="win-count">{{ allInfo.winCount2 }}</span>
          </div>
          <div class="player-info-small">
            <div class="player-name">{{ currentGame.username2 }}</div>
            <div>({{ currentGame.realname2 }})</div>
          </div>
        </div>

        <el-table
          :data="allInfo.history_game"
          border
          stripe
          :cell-style="setCellStyle"
          :header-cell-style="setHeaderStyle"
          @cell-click="handleCellClick"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column label="姓名" align="center" width="140">
            <template #default="{ row }">
              <router-link :to="`/user/${row.uid1}`" class="user-link">
                {{ row.username1 }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column label="姓名" align="center" width="140">
            <template #default="{ row }">
              <router-link :to="`/user/${row.uid2}`" class="user-link">
                {{ row.username2 }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column label="比分" align="center" width="120">
            <template #default="{ row }">
              <span class="score-link" @click.stop="openMatch(row.gameid)"
                >{{ row.result1 }}:{{ row.result2 }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="change_score1" label="变化" align="center" width="110" />
          <el-table-column prop="start_time" label="日期" align="center" width="120" />
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getGameDetailByGameid } from '@/api/match';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  gameid: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:visible', 'open-match']);

const router = useRouter();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const loading = ref(false);
const allInfo = ref({
  current_game: {},
  winCount1: 0,
  winCount2: 0,
  history_game: [],
});

const currentGame = computed(() => {
  return allInfo.value.current_game || {};
});

const crtGameId = ref('');

const loadData = () => {
  if (!props.gameid) return;

  crtGameId.value = props.gameid;
  loading.value = true;

  getGameDetailByGameid(props.gameid)
    .then((res) => {
      allInfo.value = res.data || {
        current_game: {},
        winCount1: 0,
        winCount2: 0,
        history_game: [],
      };
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => props.gameid,
  (newGameid) => {
    if (newGameid) {
      loadData();
    }
  },
  { immediate: true },
);

const setHeaderStyle = () => {
  return {
    fontSize: '14px',
    paddingLeft: '0px',
    paddingRight: '0px',
  };
};

const setCellStyle = ({ row, column }) => {
  const obj = {
    fontSize: '14px',
    paddingLeft: '0px',
    paddingRight: '0px',
  };
  if (column.label === '姓名') {
    if (column.property === 'username1' && row.result1 > row.result2) {
      obj.background = '#A7D6A9';
    }
    if (column.property === 'username2' && row.result2 > row.result1) {
      obj.background = '#A7D6A9';
    }
  }
  return obj;
};

const handleCellClick = (row, column, cell, event) => {
  if (column.label === '姓名') {
    const uid = column.property === 'username1' ? row.uid1 : row.uid2;
    router.push(`/user/${uid}`);
  }
  if (column.label === '比分' && crtGameId.value !== row.gameid) {
    openMatch(row.gameid);
  }
};

const openMatch = (gameid) => {
  emit('open-match', gameid);
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.match-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.players-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f89703 0%, #fbb03b 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.player-name {
  margin-top: 12px;
  font-size: 18px;
  color: #000;
  font-weight: 500;
}

.player-score {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
}

.vs-text {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
}

.section-title {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin: 30px 0 20px;
}

.info-box {
  box-sizing: border-box;
  margin: 0 auto;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  border: 1px solid #39b54a;
  border-radius: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 16px;
  color: #39b54a;
}

.event-link {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.score-label {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 48px;
  font-weight: bold;
  color: #e6326e;
  width: 80px;
  text-align: center;
}

.score-small {
  font-size: 24px;
  color: #000;
  width: 60px;
  text-align: center;
}

.change-score {
  font-size: 18px;
  color: #000;
  width: 60px;
  text-align: center;
}

.score-sep {
  padding: 0 20px;
  font-size: 24px;
  color: #333;
}

.history-section {
  margin-top: 40px;
}

.players-vs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}

.player-info-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 150px;

  .player-name {
    margin-top: 0;
    font-size: 16px;
  }
}

.vs-score {
  display: flex;
  align-items: center;
}

.win-count {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.sep {
  padding: 0 30px;
  font-size: 18px;
  color: #333;
}

.score-link {
  color: #409eff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.user-link {
  color: #409eff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
