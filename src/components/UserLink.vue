<template>
  <router-link v-if="uid" :to="`/user/${uid}`" class="user-link">
    <slot>{{ name }}</slot>
  </router-link>
  <slot v-else>{{ name }}</slot>
</template>

<script setup>
defineProps({
  uid: {
    type: [String, Number],
    default: ''
  },
  name: {
    type: String,
    default: ''
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
</style>
