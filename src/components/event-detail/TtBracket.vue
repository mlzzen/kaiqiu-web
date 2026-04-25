<template>
  <div v-if="ttGames.length" class="results-tt">
    <div class="results-tt-title">淘汰赛对阵</div>
    <div class="results-tt-bracket">
      <div
        v-for="(round, roundIndex) in resultTtRounds"
        :key="roundIndex"
        class="results-tt-column"
      >
        <div class="results-tt-round-name">{{ round.roundname }}</div>
        <div class="results-tt-round-body">
          <div
            v-for="(game, gameIndex) in round.games"
            :key="gameIndex"
            class="results-tt-game"
            :style="getTtGameStyle(roundIndex, gameIndex, round.games.length)"
          >
            <div class="results-tt-player" :class="{ winner: game.winner1 }">
              <span class="results-tt-name">{{ game.username1 }}</span>
              <span v-if="game.gameid" class="results-tt-score" @click="openMatch(game.gameid)">
                {{ game.result1 }}
              </span>
              <span v-else class="results-tt-score">{{ game.result1 }}</span>
            </div>
            <div class="results-tt-divider"></div>
            <div class="results-tt-player" :class="{ winner: game.winner2 }">
              <span class="results-tt-name">{{ game.username2 }}</span>
              <span v-if="game.gameid" class="results-tt-score" @click="openMatch(game.gameid)">
                {{ game.result2 }}
              </span>
              <span v-else class="results-tt-score">{{ game.result2 }}</span>
            </div>
            <div class="results-tt-connector" v-if="roundIndex < resultTtRounds.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <MatchDetailDialog
    v-model:visible="dialogVisible"
    :gameid="currentGameid"
    @open-match="openMatch"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import MatchDetailDialog from '../MatchDetailDialog.vue';

const props = defineProps({
  ttGames: {
    type: Array,
    default: () => [],
  },
});

const dialogVisible = ref(false);
const currentGameid = ref('');

const openMatch = (gameid) => {
  currentGameid.value = gameid;
  dialogVisible.value = true;
};

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
  return (props.ttGames || [])
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
</script>

<style scoped>
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
  cursor: pointer;
}

.results-tt-score:hover {
  text-decoration: underline;
}
</style>
