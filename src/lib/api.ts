import { supabase } from './supabase'
import { BREADS, getBread, traysPerBox } from './breads'
import type { DailyRecord, StockAdjustment } from './types'

export function todayStr(): string {
  return new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time
}

function requireClient() {
  if (!supabase) throw new Error('Supabase 未配置，请先设置 .env 中的连接信息')
  return supabase
}

// 某一天所有面包的记录，按 bread_key 索引
export async function fetchRecordsForDate(date: string): Promise<Record<string, DailyRecord>> {
  const client = requireClient()
  const { data, error } = await client.from('daily_records').select('*').eq('record_date', date)
  if (error) throw error
  const map: Record<string, DailyRecord> = {}
  for (const row of data ?? []) map[row.bread_key] = row as DailyRecord
  return map
}

// 某个面包在某天之前最近一条记录的库存（用作"昨日库存"），没有记录则为 0
export async function fetchLatestStockBefore(breadKey: string, date: string): Promise<number> {
  const client = requireClient()
  const { data, error } = await client
    .from('daily_records')
    .select('stock_trays')
    .eq('bread_key', breadKey)
    .lt('record_date', date)
    .order('record_date', { ascending: false })
    .limit(1)
  if (error) throw error
  return data && data.length > 0 ? data[0].stock_trays : 0
}

// 某个面包最近 N 条记录（严格早于 date）的烤量数组，用于算 7 天平均。
// 只统计实际有烘烤的日子（烤量>0），避免进货日/空白日把平均值拉低导致预警失灵
export async function fetchRecentBakeTrays(breadKey: string, date: string, days = 7): Promise<number[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('daily_records')
    .select('bake_trays')
    .eq('bread_key', breadKey)
    .lt('record_date', date)
    .gt('bake_trays', 0)
    .order('record_date', { ascending: false })
    .limit(days)
  if (error) throw error
  return (data ?? []).map((r) => r.bake_trays)
}

// 最近一个有烘烤日子（严格早于 date）的烤量，用于预警计算；没有则为 0
export async function fetchLatestBakeBefore(breadKey: string, date: string): Promise<number> {
  const client = requireClient()
  const { data, error } = await client
    .from('daily_records')
    .select('bake_trays')
    .eq('bread_key', breadKey)
    .lt('record_date', date)
    .gt('bake_trays', 0)
    .order('record_date', { ascending: false })
    .limit(1)
  if (error) throw error
  return data && data.length > 0 ? data[0].bake_trays : 0
}

export function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export async function upsertRecord(
  date: string,
  breadKey: string,
  boxIn: number,
  bakeTrays: number,
  stockAdjust = 0,
): Promise<DailyRecord> {
  const client = requireClient()
  const bread = getBread(breadKey)
  const prevStock = await fetchLatestStockBefore(breadKey, date)
  const stockTrays = prevStock + boxIn * traysPerBox(bread) - bakeTrays + stockAdjust

  const { data, error } = await client
    .from('daily_records')
    .upsert(
      {
        record_date: date,
        bread_key: breadKey,
        box_in: boxIn,
        bake_trays: bakeTrays,
        stock_trays: stockTrays,
        stock_adjust: stockAdjust,
      },
      { onConflict: 'record_date,bread_key' },
    )
    .select()
    .single()
  if (error) throw error
  return data as DailyRecord
}

// 盘点修改库存：把某个面包当天的库存直接设为 newTotalTrays（盘），
// 差额记入 stock_adjust 保持公式一致，并写一条盘点调整日志
export async function adjustStock(
  date: string,
  breadKey: string,
  newTotalTrays: number,
): Promise<{ oldTrays: number; newTrays: number }> {
  const client = requireClient()
  const bread = getBread(breadKey)
  const prevStock = await fetchLatestStockBefore(breadKey, date)

  const { data: existing, error: fetchErr } = await client
    .from('daily_records')
    .select('*')
    .eq('record_date', date)
    .eq('bread_key', breadKey)
    .maybeSingle()
  if (fetchErr) throw fetchErr

  const boxIn = existing?.box_in ?? 0
  const bakeTrays = existing?.bake_trays ?? 0
  const oldTrays = existing ? existing.stock_trays : prevStock
  const stockAdjust = newTotalTrays - (prevStock + boxIn * traysPerBox(bread) - bakeTrays)

  await upsertRecord(date, breadKey, boxIn, bakeTrays, stockAdjust)

  const { error: logErr } = await client.from('stock_adjustments').insert({
    record_date: date,
    bread_key: breadKey,
    old_trays: oldTrays,
    new_trays: newTotalTrays,
  })
  if (logErr) throw logErr

  return { oldTrays, newTrays: newTotalTrays }
}

export async function fetchAdjustmentsForDate(date: string): Promise<StockAdjustment[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('stock_adjustments')
    .select('*')
    .eq('record_date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as StockAdjustment[]
}

// 历史记录：按日期分组，最近在前
export async function fetchHistoryDates(limit = 60): Promise<string[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('daily_records')
    .select('record_date')
    .order('record_date', { ascending: false })
  if (error) throw error
  const dates = Array.from(new Set((data ?? []).map((r) => r.record_date)))
  return dates.slice(0, limit)
}

export async function fetchAllBreadKeys(): Promise<string[]> {
  return BREADS.map((b) => b.key)
}
