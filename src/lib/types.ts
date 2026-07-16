export interface DailyRecord {
  id?: string
  record_date: string // YYYY-MM-DD
  bread_key: string
  box_in: number // 今日入库（箱）
  bake_trays: number // 今日烤量（盘）
  stock_trays: number // 当日结算库存（盘，内部最小单位）
}

// day1 = 不够用一天（最紧急），day2 = 不够用两天，day3 = 还够用三天，null = 安全
export type WarningTier = 'day1' | 'day2' | 'day3' | null

export interface BreadDayView {
  key: string
  name: string
  traysPerBag: number
  boxIn: number
  bakeTrays: number
  stockTrays: number
  avg7: number
  warningTier: WarningTier
  restockBoxes: number
}
