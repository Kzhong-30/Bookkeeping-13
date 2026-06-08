<template>
  <div class="page-container">
    <div class="header-card">
      <div class="header-title">
        <h2>{{ currentMonth }} 账单</h2>
      </div>
      <div class="balance-section">
        <div class="balance-label">本月结余</div>
        <div class="balance-amount">¥{{ formatNumber(overview.balance) }}</div>
      </div>
      <div class="income-expense">
        <div class="item">
          <div class="label">收入</div>
          <div class="amount income">+¥{{ formatNumber(overview.income) }}</div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div class="label">支出</div>
          <div class="amount expense">-¥{{ formatNumber(overview.expense) }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">最近交易</span>
        <router-link to="/record" class="add-btn">
          <el-icon><Plus /></el-icon> 记一笔
        </router-link>
      </div>
      <div v-if="recentTransactions.length === 0" class="empty-state">
        <el-icon :size="48" color="#c0c4cc"><Tickets /></el-icon>
        <p>暂无交易记录</p>
      </div>
      <div v-else class="transaction-list">
        <div v-for="item in recentTransactions" :key="item.id" class="transaction-item">
          <div class="transaction-left">
            <div class="category-icon" :class="item.type">
              <el-icon><component :is="resolveCategoryIcon(item.categoryId)" /></el-icon>
            </div>
            <div class="transaction-info">
              <div class="category-name">{{ resolveCategoryName(item.categoryId) }}</div>
              <div class="transaction-date">{{ item.date }} {{ item.remark }}</div>
            </div>
          </div>
          <div class="transaction-amount" :class="item.type">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ formatNumber(item.amount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Tickets } from '@element-plus/icons-vue'
import { db } from '../db'
import { formatNumber, getCategoryName, getCategoryIcon } from '../utils'
import type { Transaction, Category, MonthlyOverview } from '../types'

const currentMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

const overview = ref<MonthlyOverview>({ income: 0, expense: 0, balance: 0 })
const recentTransactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])

function resolveCategoryName(categoryId: number): string {
  return getCategoryName(categoryId, categories.value)
}

function resolveCategoryIcon(categoryId: number): string {
  return getCategoryIcon(categoryId, categories.value)
}

async function loadData() {
  categories.value = await db.categories.toArray()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

  const monthTransactions = await db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()

  overview.value.income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  overview.value.expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  overview.value.balance = overview.value.income - overview.value.expense

  recentTransactions.value = await db.transactions.orderBy('createdAt').reverse().limit(5).toArray()
}

const route = useRoute()

onMounted(() => {
  loadData()
})

watch(
  () => route.fullPath,
  () => {
    if (route.path === '/home') {
      loadData()
    }
  }
)
</script>

<style scoped>
.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 16px;
}

.header-title h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.balance-section {
  text-align: center;
  margin-bottom: 20px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 700;
}

.income-expense {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.income-expense .item {
  text-align: center;
  flex: 1;
}

.income-expense .label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.income-expense .amount {
  font-size: 18px;
  font-weight: 600;
}

.income-expense .amount.income {
  color: #67c23a;
}

.income-expense .amount.expense {
  color: #f56c6c;
}

.income-expense .divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.add-btn {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-state p {
  margin-top: 12px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.category-icon.income {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.category-icon.expense {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.transaction-info .category-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.transaction-info .transaction-date {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount.income {
  color: #67c23a;
}

.transaction-amount.expense {
  color: #f56c6c;
}
</style>
