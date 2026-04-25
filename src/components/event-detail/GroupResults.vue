<template>
  <template v-if="groups.length">
    <div v-for="(group, groupIndex) in groups" :key="groupIndex" class="results-group">
      <div class="results-group-title">第{{ groupIndex + 1 }}台</div>
      <div class="results-table-wrap">
        <el-table
          :data="buildResultRows(group)"
          border
          class="results-table"
          :cell-style="setResultCellStyle"
          :header-cell-style="setResultHeaderStyle"
          size="small"
        >
          <el-table-column
            prop="newUsername"
            :label="`第${groupIndex + 1}组`"
            width="100"
            fixed="left"
            align="center"
          >
            <template #default="scope">
              <UserLink :uid="scope.row.uid" :name="scope.row.newUsername" />
            </template>
          </el-table-column>
          <el-table-column
            v-for="col in getResultColumns(group)"
            :key="col.key"
            :prop="col.key"
            :label="col.label"
            :width="col.width"
            align="center"
          >
            <template #default="scope">
              {{ scope.row.gameid }}
              {{ scope.row[col.key] ?? '' }}</template
            >
          </el-table-column>
          <el-table-column prop="score" label="积分" width="60" align="center" />
          <el-table-column prop="process" label="计算" width="80" align="center">
            <template #default="scope">
              <div class="results-calc">
                <span v-for="(step, idx) in scope.row.process || []" :key="idx">{{ step }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="名次" width="60" align="center" />
        </el-table>
      </div>

      <div v-if="group?.[0]?.detail_games?.length" class="results-detail">
        <div class="results-detail-toggle" @click="toggleGroupDetail(groupIndex)">
          {{ isGroupDetailOpen(groupIndex) ? '隐藏' : '显示' }}第{{ groupIndex + 1 }}组详细成绩
        </div>
        <template v-if="isGroupDetailOpen(groupIndex)">
          <div
            v-for="info in group[0].detail_games"
            :key="info.tgameid"
            class="results-detail-round"
          >
            <div class="results-detail-round-name">{{ info.roundname }}</div>
            <div class="results-detail-table-wrap">
              <el-table
                :data="info.games || []"
                border
                class="results-detail-table"
                :cell-style="setDetailCellStyle"
                :header-cell-style="setResultHeaderStyle"
                size="small"
              >
                <el-table-column type="index" label="序号" width="50" align="center" />
                <el-table-column prop="username1" label="选手1" width="140" align="center">
                  <template #default="scope">
                    <div
                      class="results-detail-name"
                      :class="{ 'is-win': scope.row.result1 > scope.row.result2 }"
                    >
                      {{ scope.row.username1 }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="username2" label="选手2" width="140" align="center">
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
                    <span
                      v-if="scope.row.gameid"
                      class="score-link"
                      @click="openMatch(scope.row.gameid)"
                    >
                      {{ `${scope.row.result1}:${scope.row.result2}` }}
                    </span>
                    <span v-else>{{ `${scope.row.result1}:${scope.row.result2}` }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="详情" width="60" align="center">
                  <template #default="scope">
                    <el-icon
                      v-if="String(scope.row.flag) === '0' && scope.row.gameid"
                      class="detail-icon"
                      @click="openMatch(scope.row.gameid)"
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
    </div>
  </template>

  <MatchDetailDialog
    v-model:visible="dialogVisible"
    :gameid="currentGameid"
    @open-match="openMatch"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import UserLink from '../UserLink.vue';
import MatchDetailDialog from '../MatchDetailDialog.vue';

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  currentItem: {
    type: Object,
    default: null,
  },
});

const resultGroupDetailOpen = ref({});
const dialogVisible = ref(false);
const currentGameid = ref('');
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

const openMatch = (gameid) => {
  currentGameid.value = gameid;
  dialogVisible.value = true;
};

function toggleGroupDetail(index) {
  resultGroupDetailOpen.value = {};
  resultGroupDetailOpen.value[index] = !isGroupDetailOpen(index);
}

function isGroupDetailOpen(index) {
  return !!resultGroupDetailOpen.value[index];
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
  const width = count ? Math.max(40, Math.floor(400 / count)) : 50;
  return Array.from({ length: count }, (_, index) => ({
    key: `col${index + 1}`,
    label: String(index + 1),
    width,
  }));
}

function setResultHeaderStyle() {
  return {
    fontSize: '11px',
    padding: '4px 2px',
  };
}

function setResultCellStyle({ row, rowIndex, columnIndex, column }) {
  const style = {
    fontSize: '11px',
    padding: '4px 2px',
    height: '28px',
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
    fontSize: '11px',
    padding: '4px 2px',
    background: '#F2F0F2',
    height: '28px',
  };
}
</script>

<style scoped>
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
  min-width: 500px;
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
  font-size: 10px;
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
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.results-detail-table {
  width: 500px;
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
