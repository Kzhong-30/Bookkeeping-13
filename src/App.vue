<template>
  <div class="app-container">
    <router-view />
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import TabBar from './components/TabBar.vue'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #f5f7fa;
}
</style>
