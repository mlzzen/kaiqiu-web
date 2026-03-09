<template>
  <router-link v-if="eventId" :to="`/event/${eventId}`" class="event-link">
    <slot>{{ name }}</slot>
  </router-link>
  <slot v-else>{{ name }}</slot>
</template>

<script setup>
defineProps({
  eventId: {
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
.event-link {
  color: #409eff;
  text-decoration: none;
}

.event-link:hover {
  text-decoration: underline;
}
</style>
