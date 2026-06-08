import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  getCategoryName,
  getCategoryIcon,
  isEChartsTooltipParamArray,
  isCancelError
} from '@/utils'
import { defaultCategories } from '@/db'
import type { Category } from '@/types'

describe('formatNumber', () => {
  it('should format integer to two decimal places', () => {
    expect(formatNumber(100)).toBe('100.00')
  })

  it('should format float correctly', () => {
    expect(formatNumber(99.9)).toBe('99.90')
    expect(formatNumber(123.456)).toBe('123.46')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0.00')
  })

  it('should handle negative numbers', () => {
    expect(formatNumber(-50.5)).toBe('-50.50')
  })
})

describe('getCategoryName', () => {
  const mockCategories: Category[] = [
    { id: 1, type: 'expense', name: '餐饮', icon: 'Food', sort: 1 },
    { id: 2, type: 'expense', name: '交通', icon: 'Van', sort: 2 },
    { id: 3, type: 'income', name: '工资', icon: 'Money', sort: 1 }
  ]

  it('should return correct category name', () => {
    expect(getCategoryName(1, mockCategories)).toBe('餐饮')
    expect(getCategoryName(3, mockCategories)).toBe('工资')
  })

  it('should return 未知 for non-existent category', () => {
    expect(getCategoryName(999, mockCategories)).toBe('未知')
  })

  it('should return 未知 for empty categories', () => {
    expect(getCategoryName(1, [])).toBe('未知')
  })
})

describe('getCategoryIcon', () => {
  const mockCategories: Category[] = [
    { id: 1, type: 'expense', name: '餐饮', icon: 'Food', sort: 1 },
    { id: 2, type: 'expense', name: '交通', icon: 'Van', sort: 2 }
  ]

  it('should return correct icon name', () => {
    expect(getCategoryIcon(1, mockCategories)).toBe('Food')
    expect(getCategoryIcon(2, mockCategories)).toBe('Van')
  })

  it('should return QuestionFilled for non-existent category', () => {
    expect(getCategoryIcon(999, mockCategories)).toBe('QuestionFilled')
  })

  it('should return QuestionFilled for empty categories', () => {
    expect(getCategoryIcon(1, [])).toBe('QuestionFilled')
  })
})

describe('isEChartsTooltipParamArray type guard', () => {
  it('should return true for valid params array', () => {
    const validParams = [
      {
        axisValue: '2024-01',
        marker: '<span></span>',
        seriesName: '收入',
        value: 10000
      }
    ]
    expect(isEChartsTooltipParamArray(validParams)).toBe(true)
  })

  it('should return false for empty array', () => {
    expect(isEChartsTooltipParamArray([])).toBe(false)
  })

  it('should return false for non-array', () => {
    expect(isEChartsTooltipParamArray(null)).toBe(false)
    expect(isEChartsTooltipParamArray(undefined)).toBe(false)
    expect(isEChartsTooltipParamArray('string')).toBe(false)
    expect(isEChartsTooltipParamArray(123)).toBe(false)
    expect(isEChartsTooltipParamArray({})).toBe(false)
  })

  it('should return false for array with missing properties', () => {
    const invalidParams = [
      {
        axisValue: '2024-01',
        marker: '<span></span>'
      }
    ]
    expect(isEChartsTooltipParamArray(invalidParams)).toBe(false)
  })
})

describe('isCancelError', () => {
  it('should return true for cancel string', () => {
    expect(isCancelError('cancel')).toBe(true)
  })

  it('should return false for other strings', () => {
    expect(isCancelError('reject')).toBe(false)
    expect(isCancelError('error')).toBe(false)
    expect(isCancelError('')).toBe(false)
  })

  it('should return false for non-string values', () => {
    expect(isCancelError(null)).toBe(false)
    expect(isCancelError(undefined)).toBe(false)
    expect(isCancelError(123)).toBe(false)
    expect(isCancelError(new Error('cancel'))).toBe(false)
  })
})

describe('defaultCategories from db', () => {
  it('should have exactly 20 default categories', () => {
    expect(defaultCategories.length).toBe(20)
  })

  it('should have 15 expense categories', () => {
    const expenseCount = defaultCategories.filter((c) => c.type === 'expense').length
    expect(expenseCount).toBe(15)
  })

  it('should have 5 income categories', () => {
    const incomeCount = defaultCategories.filter((c) => c.type === 'income').length
    expect(incomeCount).toBe(5)
  })

  it('should have unique sort orders within each type', () => {
    const expenseSorts = defaultCategories.filter((c) => c.type === 'expense').map((c) => c.sort)
    const incomeSorts = defaultCategories.filter((c) => c.type === 'income').map((c) => c.sort)

    expect(new Set(expenseSorts).size).toBe(expenseSorts.length)
    expect(new Set(incomeSorts).size).toBe(incomeSorts.length)
  })

  it('should not have empty category names', () => {
    const hasEmptyName = defaultCategories.some((c) => !c.name.trim())
    expect(hasEmptyName).toBe(false)
  })

  it('should not have empty icon names', () => {
    const hasEmptyIcon = defaultCategories.some((c) => !c.icon.trim())
    expect(hasEmptyIcon).toBe(false)
  })

  it('should only contain valid type values', () => {
    const validTypes = new Set(['expense', 'income'])
    const hasInvalidType = defaultCategories.some((c) => !validTypes.has(c.type))
    expect(hasInvalidType).toBe(false)
  })

  it('should have matching icon names with getCategoryIcon', () => {
    const categoriesWithIds: Category[] = defaultCategories.map((c, i) => ({
      ...c,
      id: i + 1
    }))
    categoriesWithIds.forEach((cat) => {
      expect(getCategoryIcon(cat.id!, categoriesWithIds)).toBe(cat.icon)
    })
  })
})
