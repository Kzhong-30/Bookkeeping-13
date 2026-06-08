<template>
  <div class="page-container">
    <div class="type-tabs">
      <div
        class="tab"
        :class="{ active: type === 'expense' }"
        @click="switchType('expense')"
      >
        支出
      </div>
      <div
        class="tab"
        :class="{ active: type === 'income' }"
        @click="switchType('income')"
      >
        收入
      </div>
    </div>

    <div class="card amount-card">
      <div class="amount-input">
        <span class="currency">¥</span>
        <input v-model="amount" type="number" placeholder="0.00" step="0.01" class="amount-field" />
      </div>
    </div>

    <div class="card categories-card">
      <div class="card-title">选择分类</div>
      <div class="category-grid">
        <div
          v-for="category in currentCategories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategoryId === category.id }"
          @click="selectedCategoryId = category.id!"
        >
          <div class="category-icon-wrapper">
            <el-icon :size="24"><component :is="category.icon" /></el-icon>
          </div>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <div class="card date-card">
      <div class="form-row">
        <span class="label">日期</span>
        <el-date-picker
          v-model="date"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          :clearable="false"
        />
      </div>
    </div>

    <div class="card remark-card">
      <div class="form-row">
        <span class="label">备注</span>
        <div class="remark-input-wrapper">
          <el-input v-model="remark" placeholder="添加备注" clearable maxlength="50" />
          <el-button
            class="voice-btn"
            :type="isListening ? 'danger' : 'primary'"
            @click="toggleVoiceInput"
          >
            <el-icon><Microphone /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <el-button
      class="submit-btn"
      type="primary"
      size="large"
      :disabled="!canSubmit"
      @click="submitRecord"
    >
      保存
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Microphone } from '@element-plus/icons-vue'
import { db } from '../db'
import type { Category } from '../types'

const router = useRouter()
const type = ref<'expense' | 'income'>('expense')
const amount = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const remark = ref('')
const selectedCategoryId = ref<number | null>(null)
const categories = ref<Category[]>([])
const isListening = ref(false)

const currentCategories = computed(() => {
  return categories.value.filter((c) => c.type === type.value).sort((a, b) => a.sort - b.sort)
})

const canSubmit = computed(() => {
  return selectedCategoryId.value !== null && parseFloat(amount.value) > 0
})

function switchType(t: 'expense' | 'income') {
  type.value = t
  selectedCategoryId.value = null
}

function toggleVoiceInput() {
  isListening.value = !isListening.value

  if (isListening.value) {
    ElMessage.info('语音输入模拟中...')

    setTimeout(() => {
      const mockRemarks = ['午餐', '打车去公司', '买水果', '工资到账', '网购衣服', '水电费']
      const randomRemark = mockRemarks[Math.floor(Math.random() * mockRemarks.length)]
      remark.value = randomRemark
      isListening.value = false
      ElMessage.success(`识别到: ${randomRemark}`)
    }, 2000)
  }
}

async function submitRecord() {
  if (!canSubmit.value) return

  try {
    await db.transactions.add({
      type: type.value,
      categoryId: selectedCategoryId.value!,
      amount: parseFloat(amount.value),
      remark: remark.value,
      date: date.value,
      createdAt: Date.now()
    })

    ElMessage.success('记账成功')

    amount.value = ''
    remark.value = ''
    selectedCategoryId.value = null

    router.push('/home')
  } catch (_error) {
    ElMessage.error('记账失败，请重试')
  }
}

onMounted(async () => {
  categories.value = await db.categories.toArray()
})
</script>

<style scoped>
.type-tabs {
  display: flex;
  background: #fff;
  border-radius: 24px;
  padding: 4px;
  margin-bottom: 16px;
}

.type-tabs .tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s;
}

.type-tabs .tab.active {
  background: #409eff;
  color: #fff;
}

.amount-card {
  text-align: center;
}

.amount-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.currency {
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.amount-field {
  font-size: 40px;
  font-weight: 700;
  color: #303133;
  border: none;
  outline: none;
  width: 200px;
  text-align: center;
}

.amount-field::placeholder {
  color: #c0c4cc;
}

.categories-card {
  max-height: 320px;
  overflow-y: auto;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: #ecf5ff;
}

.category-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.category-item.active .category-icon-wrapper {
  background: #409eff;
  color: #fff;
}

.category-name {
  font-size: 12px;
  color: #606266;
}

.category-item.active .category-name {
  color: #409eff;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-row .label {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.remark-input-wrapper {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 280px;
}

.voice-btn {
  padding: 0 16px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  border-radius: 12px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}
</style>
