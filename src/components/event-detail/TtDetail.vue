<template>
  <div v-if="ttDetailGames.length" class="results-tt-detail">
    <div class="results-detail-toggle" @click="showTtDetail = !showTtDetail">
      {{ showTtDetail ? '隐藏' : '显示' }}淘汰赛详细成绩
    </div>
    <template v-if="showTtDetail">
      <div
        v-for="info in ttDetailGames"
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
</template>

<script setup>
import { ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

defineProps({
  ttDetailGames: {
    type: Array,
    default: () => [],
  },
});

const showTtDetail = ref(false);

function setResultHeaderStyle() {
  return {
    fontSize: '12px',
    padding: '6px 4px',
  };
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
</style>
