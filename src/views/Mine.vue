<template>
  <div class="page-container">
    <div class="user-header">
      <div class="avatar">
        <el-icon :size="32"><UserFilled /></el-icon>
      </div>
      <div class="user-info">
        <h2>我的账本</h2>
        <p>坚持记账，财务自由</p>
      </div>
    </div>

    <div class="card">
      <div class="card-title">{{ currentYear }}年度总览</div>
      <div class="year-stats">
        <div class="stat-item">
          <div class="stat-label">总收入</div>
          <div class="stat-value income">+¥{{ formatNumber(yearStats.income) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总支出</div>
          <div class="stat-value expense">-¥{{ formatNumber(yearStats.expense) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">结余</div>
          <div class="stat-value balance">¥{{ formatNumber(yearStats.balance) }}</div>
        </div>
      </div>
    </div>

    <div class="card menu-card">
      <div class="menu-item" @click="showCategoryManager = true">
        <div class="menu-left">
          <div class="menu-icon category-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <span class="menu-text">分类管理</span>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="exportData">
        <div class="menu-left">
          <div class="menu-icon export-icon">
            <el-icon><Download /></el-icon>
          </div>
          <span class="menu-text">数据备份</span>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="triggerImport">
        <div class="menu-left">
          <div class="menu-icon import-icon">
            <el-icon><Upload /></el-icon>
          </div>
          <span class="menu-text">数据恢复</span>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="importData"
      />
    </div>

    <div class="card about-card">
      <div class="menu-item">
        <div class="menu-left">
          <div class="menu-icon about-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <span class="menu-text">关于</span>
        </div>
        <span class="version">v1.0.0</span>
      </div>
    </div>

    <el-dialog v-model="showCategoryManager" title="分类管理" width="90%" :max-height="500">
      <el-tabs v-model="activeCategoryTab">
        <el-tab-pane label="支出分类" name="expense">
          <div class="category-list">
            <div
              v-for="category in expenseCategories"
              :key="category.id"
              class="category-edit-item"
            >
              <div class="category-edit-left">
                <div class="category-edit-icon">
                  <el-icon><component :is="category.icon" /></el-icon>
                </div>
                <span>{{ category.name }}</span>
              </div>
              <el-button
                v-if="category.id! > 15"
                size="small"
                type="danger"
                link
                @click="deleteCategory(category.id!)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="收入分类" name="income">
          <div class="category-list">
            <div v-for="category in incomeCategories" :key="category.id" class="category-edit-item">
              <div class="category-edit-left">
                <div class="category-edit-icon">
                  <el-icon><component :is="category.icon" /></el-icon>
                </div>
                <span>{{ category.name }}</span>
              </div>
              <el-button
                v-if="category.id! > 20"
                size="small"
                type="danger"
                link
                @click="deleteCategory(category.id!)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button type="primary" @click="showAddCategory = true"> 添加分类 </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddCategory" title="添加分类" width="80%">
      <el-form label-width="60px">
        <el-form-item label="类型">
          <el-radio-group v-model="newCategory.type">
            <el-radio value="expense">支出</el-radio>
            <el-radio value="income">收入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="newCategory.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="newCategory.icon" placeholder="选择图标">
            <el-option v-for="icon in availableIcons" :key="icon" :label="icon" :value="icon" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="addCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { db } from '../db'
import { isCancelError } from '../utils'
import type { Category } from '../types'

const currentYear = computed(() => new Date().getFullYear())
const yearStats = ref({ income: 0, expense: 0, balance: 0 })
const categories = ref<Category[]>([])
const showCategoryManager = ref(false)
const showAddCategory = ref(false)
const activeCategoryTab = ref<'expense' | 'income'>('expense')
const fileInput = ref<HTMLInputElement>()

const newCategory = reactive({
  type: 'expense' as 'expense' | 'income',
  name: '',
  icon: 'Star'
})

const availableIcons = [
  'Food',
  'Van',
  'ShoppingBag',
  'Film',
  'HomeFilled',
  'Iphone',
  'FirstAidKit',
  'Reading',
  'Tshirt',
  'Bicycle',
  'MagicStick',
  'Dog',
  'Present',
  'Cpu',
  'MoreFilled',
  'Money',
  'Trophy',
  'TrendCharts',
  'Briefcase',
  'Plus',
  'Star',
  'Heart',
  'Coffee',
  'Cup'
]

const expenseCategories = computed(() =>
  categories.value.filter((c) => c.type === 'expense').sort((a, b) => a.sort - b.sort)
)

const incomeCategories = computed(() =>
  categories.value.filter((c) => c.type === 'income').sort((a, b) => a.sort - b.sort)
)

function formatNumber(num: number): string {
  return num.toFixed(2)
}

async function loadYearStats() {
  const year = new Date().getFullYear()
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const yearTransactions = await db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()

  yearStats.value.income = yearTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  yearStats.value.expense = yearTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  yearStats.value.balance = yearStats.value.income - yearStats.value.expense
}

async function loadCategories() {
  categories.value = await db.categories.toArray()
}

async function exportData() {
  try {
    const transactions = await db.transactions.toArray()
    const categories = await db.categories.toArray()

    const data = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      transactions,
      categories
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('数据备份成功')
  } catch (_error) {
    ElMessage.error('数据备份失败')
  }
}

function triggerImport() {
  fileInput.value?.click()
}

async function importData(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    await ElMessageBox.confirm('恢复数据将覆盖现有数据，是否继续？', '数据恢复', {
      type: 'warning'
    })

    await db.transactions.clear()
    await db.categories.clear()

    if (data.transactions?.length) {
      await db.transactions.bulkAdd(data.transactions)
    }
    if (data.categories?.length) {
      await db.categories.bulkAdd(data.categories)
    }

    await loadYearStats()
    await loadCategories()

    ElMessage.success('数据恢复成功')
  } catch (error) {
    if (!isCancelError(error)) {
      ElMessage.error('数据恢复失败，请检查文件格式')
    }
  }

  ;(event.target as HTMLInputElement).value = ''
}

async function addCategory() {
  if (!newCategory.name) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    const maxSort = Math.max(
      ...categories.value.filter((c) => c.type === newCategory.type).map((c) => c.sort),
      0
    )

    await db.categories.add({
      type: newCategory.type,
      name: newCategory.name,
      icon: newCategory.icon,
      sort: maxSort + 1
    })

    await loadCategories()
    showAddCategory.value = false
    newCategory.name = ''
    newCategory.icon = 'Star'

    ElMessage.success('分类添加成功')
  } catch (_error) {
    ElMessage.error('分类添加失败')
  }
}

async function deleteCategory(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该分类吗？', '删除分类', { type: 'warning' })

    await db.categories.delete(id)
    await loadCategories()

    ElMessage.success('分类删除成功')
  } catch (error) {
    if (!isCancelError(error)) {
      ElMessage.error('分类删除失败')
    }
  }
}

const route = useRoute()
let dataInitialized = false

onMounted(() => {
  loadYearStats()
  loadCategories()
  dataInitialized = true
})

watch(
  () => route.fullPath,
  () => {
    if (route.path === '/mine' && dataInitialized) {
      loadYearStats()
      loadCategories()
    }
  }
)
</script>

<style scoped>
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.user-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.user-info p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.year-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-value.income {
  color: #67c23a;
}

.stat-value.expense {
  color: #f56c6c;
}

.stat-value.balance {
  color: #409eff;
}

.menu-card,
.about-card {
  padding: 0;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item + .menu-item {
  border-top: 1px solid #f0f0f0;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.category-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.export-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.import-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.about-icon {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

.menu-text {
  font-size: 15px;
  color: #303133;
}

.arrow-icon {
  color: #c0c4cc;
}

.version {
  font-size: 14px;
  color: #909399;
}

.category-list {
  max-height: 350px;
  overflow-y: auto;
}

.category-edit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-edit-item:last-child {
  border-bottom: none;
}

.category-edit-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-edit-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}
</style>
