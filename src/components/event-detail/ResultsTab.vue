<template>
  <div class="results" v-loading="loading">
    <div v-if="resultHonors.length" class="results-honors">
      <div class="results-honors-title">名次列表</div>
      <div v-for="(item, index) in resultHonors" :key="index" class="results-honor-row">
        <div class="results-honor-team">
          <div class="results-honor-rank">{{ item.honor }}</div>
          <div class="results-honor-info">
            <div v-if="item.teamname" class="results-honor-name" :class="{ 'is-first': index === 0 }">
              {{ item.teamname }}
            </div>
            <div class="results-honor-members">
              <template v-if="item.members && item.members.length">
                <span v-for="(member, mIdx) in item.members" :key="member.uid">
                  <UserLink v-if="member.uid && member.uid !== '0'" :uid="member.uid" :name="member.name" />
                  <span v-else>{{ member.name }}</span>
                  <span v-if="mIdx < item.members.length - 1"> / </span>
                </span>
              </template>
              <template v-else-if="item.uid && item.uid !== '0'">
                <UserLink :uid="item.uid" :name="item.name" />
              </template>
              <template v-else>
                {{ item.name }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="resultGroups.length">
      <div v-for="(group, groupIndex) in resultGroups" :key="groupIndex" class="results-group">
        <div class="results-group-title">第{{ groupIndex + 1 }}台</div>
        <div class="results-table-wrap">
          <el-table
            :data="buildResultRows(group)"
            border
            class="results-table"
            :cell-style="setResultCellStyle"
            :header-cell-style="setResultHeaderStyle">
            <el-table-column
              prop="newUsername"
              :label="`第${groupIndex + 1}组`"
              width="120"
              fixed="left"
              align="center">
              <template #default="scope">
                <UserLink :uid="scope.row.uid" :name="scope.row.newUsername" />
              </template>
            </el-table-column>
            <el-table-column v-for="col in getResultColumns(group)" :key="col.key" :prop="col.key"
              :label="col.label"
              :width="col.width" align="center">
              <template #default="scope">
                {{ scope.row.gameid }}
                {{ scope.row[col.key] ?? '' }}</template>
            </el-table-column>
            <el-table-column prop="score" label="积分" width="70" align="center" />
            <el-table-column prop="process" label="计算" width="90" align="center">
              <template #default="scope">
                <div class="results-calc">
                  <span v-for="(step, idx) in scope.row.process || []" :key="idx">{{
                    step
                    }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="rank" label="名次" width="70" align="center" />
          </el-table>
        </div>

        <div v-if="group?.[0]?.detail_games?.length" class="results-detail">
          <div class="results-detail-toggle" @click="toggleGroupDetail(groupIndex)">
            {{ isGroupDetailOpen(groupIndex) ? '隐藏' : '显示' }}第{{
              groupIndex + 1
            }}组详细成绩
          </div>
          <template v-if="isGroupDetailOpen(groupIndex)">
            <div
              v-for="info in group[0].detail_games"
              :key="info.tgameid"
              class="results-detail-round">
              <div class="results-detail-round-name">{{ info.roundname }}</div>
              <div class="results-detail-table-wrap">
                <el-table
                  :data="info.games || []"
                  border
                  class="results-detail-table"
                  :cell-style="setDetailCellStyle"
                  :header-cell-style="setResultHeaderStyle">
                  <el-table-column type="index" label="序号" width="70" align="center" />
                  <el-table-column prop="username1" label="选手1" width="200" align="center">
                    <template #default="scope">
                      <div
                        class="results-detail-name"
                        :class="{ 'is-win': scope.row.result1 > scope.row.result2 }">
                        {{ scope.row.username1 }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="username2" label="选手2" width="200" align="center">
                    <template #default="scope">
                      <div
                        class="results-detail-name"
                        :class="{ 'is-win': scope.row.result2 > scope.row.result1 }">
                        {{ scope.row.username2 }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="比分" width="90" align="center">
                    <template #default="scope">
                      <router-link
                        v-if="scope.row.gameid"
                        :to="`/match/${scope.row.gameid}`"
                        class="score-link">
                        {{ `${scope.row.result1}:${scope.row.result2}` }}
                      </router-link>
                      <span v-else>{{ `${scope.row.result1}:${scope.row.result2}` }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="详情" width="70" align="center">
                    <template #default="scope">
                      <router-link
                        v-if="String(scope.row.flag) === '0' && scope.row.gameid"
                        :to="`/match/${scope.row.gameid}`">
                        <el-icon>
                          <ArrowRight />
                        </el-icon>
                      </router-link>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <div v-if="resultTtRounds.length" class="results-tt">
      <div class="results-tt-title">淘汰赛对阵</div>
      <div class="results-tt-bracket">
        <div v-for="(round, roundIndex) in resultTtRounds" :key="roundIndex" class="results-tt-column">
          <div class="results-tt-round-name">{{ round.roundname }}</div>
          <div class="results-tt-round-body">
            <div v-for="(game, gameIndex) in round.games" :key="gameIndex" class="results-tt-game"
              :style="getTtGameStyle(roundIndex, gameIndex, round.games.length)">
              <div class="results-tt-player" :class="{ winner: game.winner1 }">
                <span class="results-tt-name">{{ game.username1 }}</span>
                <router-link v-if="game.gameid" :to="`/match/${game.gameid}`" class="results-tt-score">
                  {{ game.result1 }}
                </router-link>
                <span v-else class="results-tt-score">{{ game.result1 }}</span>
              </div>
              <div class="results-tt-divider"></div>
              <div class="results-tt-player" :class="{ winner: game.winner2 }">
                <span class="results-tt-name">{{ game.username2 }}</span>
                <router-link v-if="game.gameid" :to="`/match/${game.gameid}`" class="results-tt-score">
                  {{ game.result2 }}
                </router-link>
                <span v-else class="results-tt-score">{{ game.result2 }}</span>
              </div>
              <div class="results-tt-connector" v-if="roundIndex < resultTtRounds.length - 1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="resultTtDetailGames.length" class="results-tt-detail">
      <div class="results-detail-toggle" @click="showTtDetail = !showTtDetail">
        {{ showTtDetail ? '隐藏' : '显示' }}淘汰赛详细成绩
      </div>
      <template v-if="showTtDetail">
        <div
          v-for="info in resultTtDetailGames"
          :key="info.tgameid"
          class="results-detail-round">
          <div class="results-detail-round-name">{{ info.roundname }}</div>
          <div class="results-detail-table-wrap">
            <el-table
              v-if="info.games?.length"
              :data="info.games"
              border
              class="results-detail-table"
              :cell-style="setDetailCellStyle"
              :header-cell-style="setResultHeaderStyle">
              <el-table-column type="index" label="序号" width="70" align="center" />
              <el-table-column prop="username1" label="选手1" width="200" align="center">
                <template #default="scope">
                  <div
                    class="results-detail-name"
                    :class="{ 'is-win': scope.row.result1 > scope.row.result2 }">
                    {{ scope.row.username1 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="username2" label="选手2" width="200" align="center">
                <template #default="scope">
                  <div
                    class="results-detail-name"
                    :class="{ 'is-win': scope.row.result2 > scope.row.result1 }">
                    {{ scope.row.username2 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="比分" width="90" align="center">
                <template #default="scope">
                  <router-link
                    v-if="scope.row.gameid"
                    :to="`/match/${scope.row.gameid}`"
                    class="score-link">
                    {{ `${scope.row.result1}:${scope.row.result2}` }}
                  </router-link>
                  <span v-else>{{ `${scope.row.result1}:${scope.row.result2}` }}</span>
                </template>
              </el-table-column>
              <el-table-column label="详情" width="70" align="center">
                <template #default="scope">
                  <router-link
                    v-if="String(scope.row.flag) === '0' && scope.row.gameid"
                    :to="`/match/${scope.row.gameid}`">
                    <el-icon>
                      <ArrowRight />
                    </el-icon>
                  </router-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </template>
    </div>

    <div v-if="!resultGroups.length && resultInit" class="results-empty">暂无成绩信息</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import UserLink from '../UserLink.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  resultGroups: {
    type: Array,
    default: () => [],
  },
  resultHonors: {
    type: Array,
    default: () => [],
  },
  resultTtGames: {
    type: Array,
    default: () => [],
  },
  resultTtDetailGames: {
    type: Array,
    default: () => [],
  },
  resultInit: {
    type: Boolean,
    default: false,
  },
  currentItem: {
    type: Object,
    default: null,
  },
});

const resultGroupDetailOpen = ref({});
const showTtDetail = ref(false);

function toggleGroupDetail(index) {
  resultGroupDetailOpen.value = {};
  resultGroupDetailOpen.value[index] = !isGroupDetailOpen(index);
}

function isGroupDetailOpen(index) {
  return !!resultGroupDetailOpen.value[index];
}

function getWinnerFlags(game = {}) {
  const result1 = String(game.result1 || '').trim();
  const result2 = String(game.result2 || '').trim();
  const winnerFlags = { winner1: false, winner2: false };
  if (game.username1 === '轮空') {
    winnerFlags.winner2 = true;
  } else if (game.username2 === '轮空') {
    winnerFlags.winner1 = true;
  } else if (result2.includes('弃')) {
    winnerFlags.winner1 = true;
  } else if (result1.includes('弃')) {
    winnerFlags.winner2 = true;
  } else {
    const score1 = parseInt(result1, 10);
    const score2 = parseInt(result2, 10);
    if (!Number.isNaN(score1) && !Number.isNaN(score2)) {
      winnerFlags.winner1 = score1 > score2;
      winnerFlags.winner2 = score2 > score1;
    }
  }
  return winnerFlags;
}

const resultTtRounds = computed(() => {
  return (props.resultTtGames || [])
    .slice()
    .sort((a, b) => Number(a?.games?.[0]?.round || 0) - Number(b?.games?.[0]?.round || 0))
    .map((round) => ({
      roundname: round.roundname,
      games: (round.games || []).map((game) => ({
        ...game,
        result1: String(game.result1 || '').trim(),
        result2: String(game.result2 || '').trim(),
        ...getWinnerFlags(game),
      })),
    }));
});

function getTtGameStyle(roundIndex, gameIndex, total) {
  const baseGap = 18;
  const gap = baseGap * Math.pow(2, roundIndex);
  const offset = roundIndex === 0 ? 0 : gap / 2;
  const marginBottom = gameIndex === total - 1 ? 0 : gap;
  return {
    marginTop: gameIndex === 0 ? `${offset}px` : '0px',
    marginBottom: `${marginBottom}px`,
  };
}

function buildResultRows(group = []) {
  if (!Array.isArray(group) || !group.length) {
    return [];
  }
  const { games = {}, colors = {}, teamid } = group[0];
  const viewId = teamid && teamid !== '0' ? 'teamid' : 'uid';
  return group.map((row, index) => {
    const matrix = group.reduce((acc, item, sindex) => {
      const key = `${group[index][viewId]}:${group[sindex][viewId]}`;
      acc[`col${sindex + 1}`] = sindex === index ? '' : games[key];
      acc[`col${sindex + 1}-color`] = sindex === index ? '' : colors[key];
      return acc;
    }, {});
    return {
      ...row,
      ...matrix,
      newUsername: `${index + 1}${row.username || row.name || ''}`,
    };
  });
}

function getResultColumns(group = []) {
  const count = Array.isArray(group) ? group.length : 0;
  const width = count ? Math.max(50, Math.floor(360 / count)) : 60;
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width,
  }));
}

function setResultHeaderStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px',
  };
}

function setResultCellStyle({ row, rowIndex, columnIndex, column }) {
  const style = {
    fontSize: '12px',
    padding: '6px 4px',
    height: '32px',
  };
  if (rowIndex + 1 === columnIndex) {
    style.background = '#F2F1EE';
  }
  if (column?.property?.startsWith('col') && row[`${column.property}-color`] === 1) {
    style.color = '#E6326E';
  }
  if (column?.property === 'rank' && Number(row.rank) <= Number(props.currentItem?.qualNum || 0)) {
    style.color = '#E6326E';
    style.fontWeight = 600;
  }
  return style;
}

function setDetailCellStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px',
    background: '#F2F0F2',
    height: '32px',
  };
}
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.results-honors {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.results-honors-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
}

.results-honor-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  cursor: pointer;
}

.results-honor-team {
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex: 1;
}

.results-honor-rank {
  width: 80px;
  color: #e6326e;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #666;
  border-right: none;
}

.results-honor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.results-honor-name {
  padding: 6px 10px;
  border: 1px solid #666;
  border-bottom: none;
  color: #2c84ff;
  font-weight: 600;
}

.results-honor-name.is-first {
  border-top: 1px solid #666;
}

.results-honor-members {
  padding: 4px 10px;
  border: 1px solid #666;
  color: #666;
  font-size: 13px;
}

.results-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-group-title {
  color: #f89703;
  font-weight: 600;
}

.results-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  overflow-x: auto;
  background: #fff;
}

.results-table {
  min-width: 720px;
}

.results-table :deep(.el-table__header-wrapper),
.results-table :deep(.el-table__body-wrapper) {
  overflow: visible;
}

.results-calc {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
}

.results-detail {
  margin-top: 8px;
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
  width: 640px;
  max-width: 100%;
}

.results-detail-table {
  width: 100%;
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

.results-tt {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f5f5f5;
}

.results-tt-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.results-tt-bracket {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.results-tt-column {
  min-width: 220px;
}

.results-tt-round-name {
  text-align: center;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
}

.results-tt-round-body {
  position: relative;
  padding: 6px 10px;
}

.results-tt-game {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.results-tt-player {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.results-tt-divider {
  height: 1px;
  background: #eee;
  margin: 6px 0;
}

.results-tt-connector {
  position: absolute;
  right: -12px;
  top: 50%;
  width: 12px;
  height: 1px;
  background: #cbd5f5;
}

.results-tt-player.winner .results-tt-name {
  color: #ff3d00;
  font-weight: 700;
}

.results-tt-score {
  color: #248dff;
}

.results-tt-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.results-empty {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
</style>
