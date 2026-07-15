export interface DailyRecord {
  id?: string
  record_date: string // YYYY-MM-DD
  bread_key: string
  bag_in: number // 今日入库（袋）
  bake_trays: number // 今日烤量（盘）
  stock_trays: number // 当日结算库存（盘）
}

export interface BreadDayView {
  key: string
  name: string
  traysPerBag: number
  bagIn: number
  bakeTrays: number
  stockTrays: number
  avg7: number
  isWarning: boolean
  restockBags: number
}
