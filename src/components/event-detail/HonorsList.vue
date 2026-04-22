<template>
  <div v-if="honors.length" class="results-honors">
    <div class="results-honors-title">名次列表</div>
    <div v-for="(item, index) in honors" :key="index" class="results-honor-row">
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
</template>

<script setup>
import UserLink from '../UserLink.vue';

defineProps({
  honors: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
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
</style>
