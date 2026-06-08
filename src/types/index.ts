export interface Transaction {
  id?: number
  type: 'income' | 'expense'
  categoryId: number
  amount: number
  remark: string
  date: string
  createdAt: number
}

export interface Category {
  id?: number
  type: 'income' | 'expense'
  name: string
  icon: string
  sort: number
}

export interface MonthlyOverview {
  income: number
  expense: number
  balance: number
}

export interface CategoryStat {
  categoryId: number
  categoryName: string
  amount: number
  percentage: number
}
