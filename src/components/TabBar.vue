<template>
  <div class="tab-bar">
    <router-link to="/home" class="tab-item">
      <el-icon :size="22"><House /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/record" class="tab-item">
      <el-icon :size="22"><Edit /></el-icon>
      <span>记账</span>
    </router-link>
    <router-link to="/statistics" class="tab-item">
      <el-icon :size="22"><DataLine /></el-icon>
      <span>统计</span>
    </router-link>
    <router-link to="/mine" class="tab-item">
      <el-icon :size="22"><User /></el-icon>
      <span>我的</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { House, Edit, DataLine, User } from '@element-plus/icons-vue'
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #909399;
  font-size: 12px;
  gap: 4px;
}

.tab-item.router-link-active {
  color: #409eff;
}
</style>
