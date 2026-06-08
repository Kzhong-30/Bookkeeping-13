import Dexie, { Table } from 'dexie'
import type { Transaction, Category } from '../types'

export const defaultCategories: Omit<Category, 'id'>[] = [
  { type: 'expense', name: '餐饮', icon: 'Food', sort: 1 },
  { type: 'expense', name: '交通', icon: 'Van', sort: 2 },
  { type: 'expense', name: '购物', icon: 'ShoppingBag', sort: 3 },
  { type: 'expense', name: '娱乐', icon: 'Film', sort: 4 },
  { type: 'expense', name: '居住', icon: 'HomeFilled', sort: 5 },
  { type: 'expense', name: '通讯', icon: 'Iphone', sort: 6 },
  { type: 'expense', name: '医疗', icon: 'FirstAidKit', sort: 7 },
  { type: 'expense', name: '教育', icon: 'Reading', sort: 8 },
  { type: 'expense', name: '服饰', icon: 'Tshirt', sort: 9 },
  { type: 'expense', name: '运动', icon: 'Bicycle', sort: 10 },
  { type: 'expense', name: '美容', icon: 'MagicStick', sort: 11 },
  { type: 'expense', name: '宠物', icon: 'Dog', sort: 12 },
  { type: 'expense', name: '礼物', icon: 'Present', sort: 13 },
  { type: 'expense', name: '数码', icon: 'Cpu', sort: 14 },
  { type: 'expense', name: '其他支出', icon: 'MoreFilled', sort: 15 },
  { type: 'income', name: '工资', icon: 'Money', sort: 1 },
  { type: 'income', name: '奖金', icon: 'Trophy', sort: 2 },
  { type: 'income', name: '投资', icon: 'TrendCharts', sort: 3 },
  { type: 'income', name: '兼职', icon: 'Briefcase', sort: 4 },
  { type: 'income', name: '其他收入', icon: 'Plus', sort: 5 }
]

class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction>
  categories!: Table<Category>

  constructor() {
    super('FinanceDB')
    this.version(1).stores({
      transactions: '++id, type, categoryId, amount, date, createdAt',
      categories: '++id, type, name, icon, sort'
    })
  }

  async initDefaultCategories() {
    const count = await this.categories.count()
    if (count === 0) {
      await this.categories.bulkAdd(defaultCategories)
    }
  }
}

export const db = new FinanceDatabase()

db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories)
})

export async function initDatabase() {
  await db.open()
  await db.initDefaultCategories()
}
