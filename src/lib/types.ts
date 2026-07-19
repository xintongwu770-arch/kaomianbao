export interface DailyRecord {
  id?: string
  record_date: string // YYYY-MM-DD
  bread_key: string
  box_in: number // 今日入库（箱）
  bake_trays: number // 今日烤量（盘）
  stock_trays: number // 当日结算库存（盘，内部最小单位）
  stock_adjust: number // 盘点调整量（盘），库存 = 昨日 + 入库 - 烤量 + 调整
}

export interface StockAdjustment {
  id?: string
  record_date: string
  bread_key: string
  old_trays: number
  new_trays: number
  created_at?: string
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
  stockAdjust: number
  avg7: number // 近7日有烘烤日子的平均烤量，用于补货建议和推荐烤量
  latestBake: number // 最近一个有烘烤日子的烤量，用于预警计算
  warningTier: WarningTier
  restockBoxes: number
}
