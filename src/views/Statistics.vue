<template>
  <div class="page-container">
    <div class="page-header">
      <h2>统计分析</h2>
    </div>

    <div class="card">
      <div class="card-title">本月支出分类</div>
      <div ref="pieChartRef" class="chart-container pie-chart"></div>
    </div>

    <div class="card">
      <div class="card-title">近6个月收支趋势</div>
      <div ref="lineChartRef" class="chart-container line-chart"></div>
    </div>

    <div class="card">
      <div class="card-title">支出排行 TOP10</div>
      <div ref="barChartRef" class="chart-container bar-chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { db } from '../db'
import { isEChartsTooltipParamArray } from '../utils'
import type { Transaction, Category } from '../types'

const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()

let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const colors = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
  '#48b4bd'
]

async function loadChartData() {
  const transactions = await db.transactions.toArray()
  const categories = await db.categories.toArray()

  initPieChart(transactions, categories)
  initLineChart(transactions)
  initBarChart(transactions, categories)
}

function initPieChart(transactions: Transaction[], categories: Category[]) {
  if (!pieChartRef.value) return

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

  const monthExpense = transactions.filter(
    (t) => t.type === 'expense' && t.date >= startDate && t.date <= endDate
  )

  const categoryMap = new Map<number, number>()
  monthExpense.forEach((t) => {
    const current = categoryMap.get(t.categoryId) || 0
    categoryMap.set(t.categoryId, current + t.amount)
  })

  const pieData = Array.from(categoryMap.entries())
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || '未知',
        value: amount
      }
    })
    .sort((a, b) => b.value - a.value)

  if (pieChart) {
    pieChart.dispose()
  }

  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData,
        color: colors
      }
    ]
  })
}

function initLineChart(transactions: Transaction[]) {
  if (!lineChartRef.value) return

  const months: string[] = []
  const incomeData: number[] = []
  const expenseData: number[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthStr = `${month + 1}月`
    months.push(monthStr)

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

    const monthTransactions = transactions.filter((t) => t.date >= startDate && t.date <= endDate)

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    incomeData.push(income)
    expenseData.push(expense)
  }

  if (lineChart) {
    lineChart.dispose()
  }

  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        if (!isEChartsTooltipParamArray(params)) {
          return ''
        }
        let result = params[0].axisValue + '<br/>'
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName}: ¥${item.value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: {
        color: '#909399',
        formatter: (value: number) => {
          if (value >= 1000) return value / 1000 + 'k'
          return value
        }
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeData,
        color: '#67c23a',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: expenseData,
        color: '#f56c6c',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  })
}

function initBarChart(transactions: Transaction[], categories: Category[]) {
  if (!barChartRef.value) return

  const expenseTransactions = transactions.filter((t) => t.type === 'expense')

  const categoryMap = new Map<number, number>()
  expenseTransactions.forEach((t) => {
    const current = categoryMap.get(t.categoryId) || 0
    categoryMap.set(t.categoryId, current + t.amount)
  })

  const barData = Array.from(categoryMap.entries())
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || '未知',
        value: amount
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .reverse()

  if (barChart) {
    barChart.dispose()
  }

  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: {
        color: '#909399',
        formatter: (value: number) => {
          if (value >= 1000) return value / 1000 + 'k'
          return value
        }
      }
    },
    yAxis: {
      type: 'category',
      data: barData.map((d) => d.name),
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        type: 'bar',
        data: barData.map((d) => d.value),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      }
    ]
  })
}

function handleResize() {
  pieChart?.resize()
  lineChart?.resize()
  barChart?.resize()
}

const route = useRoute()
let chartsInitialized = false

onMounted(() => {
  loadChartData()
  chartsInitialized = true
  window.addEventListener('resize', handleResize)
})

watch(
  () => route.fullPath,
  () => {
    if (route.path === '/statistics' && chartsInitialized) {
      loadChartData()
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-container {
  width: 100%;
}

.pie-chart {
  height: 280px;
}

.line-chart {
  height: 250px;
}

.bar-chart {
  height: 300px;
}
</style>
