import type { Category } from '../types'

export function formatNumber(num: number): string {
  return num.toFixed(2)
}

export function getCategoryName(categoryId: number, categories: Category[]): string {
  const category = categories.find((c) => c.id === categoryId)
  return category?.name || '未知'
}

export function getCategoryIcon(categoryId: number, categories: Category[]): string {
  const category = categories.find((c) => c.id === categoryId)
  return category?.icon || 'QuestionFilled'
}

export interface EChartsTooltipParam {
  axisValue: string
  marker: string
  seriesName: string
  value: number
}

export function isEChartsTooltipParamArray(params: unknown): params is EChartsTooltipParam[] {
  return (
    Array.isArray(params) &&
    params.length > 0 &&
    typeof params[0] === 'object' &&
    params[0] !== null &&
    'axisValue' in params[0] &&
    'marker' in params[0] &&
    'seriesName' in params[0] &&
    'value' in params[0]
  )
}

export function isCancelError(error: unknown): boolean {
  return typeof error === 'string' && error === 'cancel'
}
