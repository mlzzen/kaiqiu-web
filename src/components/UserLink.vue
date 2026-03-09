<template>
  <router-link v-if="uid" :to="`/user/${uid}`" class="user-link" :class="{ 'is-following': isFollowing }">
    <slot>{{ name }}</slot>
    <span v-if="subName" class="sub-name">({{ subName }})</span>
  </router-link>
  <slot v-else>{{ name }}</slot>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  uid: {
    type: [String, Number],
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  subName: {
    type: String,
    default: ''
  },
})

const isFollowing = computed(() => {
  try {
    const followees = JSON.parse(localStorage.getItem('userFollowees') || '[]')
    return followees.includes(String(props.uid))
  } catch {
    return false
  }
})
</script>

<style scoped>
.user-link {
  color: #409eff;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}

.user-link.is-following {
  color: #67c23a;
}
</style>
