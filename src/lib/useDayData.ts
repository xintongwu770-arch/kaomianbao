import { useCallback, useEffect, useState } from 'react'
import { BREADS, traysPerBox } from './breads'
import type { BreadDayView, WarningTier } from './types'
import {
  average,
  fetchLatestBakeBefore,
  fetchLatestStockBefore,
  fetchRecentBakeTrays,
  fetchRecordsForDate,
  todayStr,
  upsertRecord,
} from './api'

// 预警按最近一个有烘烤日子的烤量计算：天数 = 库存 ÷ 该日烤量
function computeWarningTier(stockTrays: number, latestBake: number): WarningTier {
  if (latestBake <= 0) return null
  const daysCoverage = stockTrays / latestBake
  if (daysCoverage < 1) return 'day1'
  if (daysCoverage < 2) return 'day2'
  if (daysCoverage < 3) return 'day3'
  return null
}

export function useDayData(date: string = todayStr()) {
  const [rows, setRows] = useState<BreadDayView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const todayRecords = await fetchRecordsForDate(date)

      const results = await Promise.all(
        BREADS.map(async (bread) => {
          const [stockBefore, recentBakes, latestBake] = await Promise.all([
            fetchLatestStockBefore(bread.key, date),
            fetchRecentBakeTrays(bread.key, date, 7),
            fetchLatestBakeBefore(bread.key, date),
          ])
          const avg7 = average(recentBakes)
          const existing = todayRecords[bread.key]
          const boxIn = existing?.box_in ?? 0
          const bakeTrays = existing?.bake_trays ?? 0
          const stockAdjust = existing?.stock_adjust ?? 0
          const stockTrays = existing ? existing.stock_trays : stockBefore
          const warningTier = computeWarningTier(stockTrays, latestBake)
          const target = avg7 * 3
          const shortfall = Math.max(0, target - stockTrays)
          const restockBoxes = Math.ceil(shortfall / traysPerBox(bread))

          const view: BreadDayView = {
            key: bread.key,
            name: bread.name,
            traysPerBag: bread.traysPerBag,
            boxIn,
            bakeTrays,
            stockTrays,
            stockAdjust,
            avg7,
            latestBake,
            warningTier,
            restockBoxes,
          }
          return view
        }),
      )
      setRows(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (breadKey: string, boxIn: number, bakeTrays: number, stockAdjust = 0) => {
      await upsertRecord(date, breadKey, boxIn, bakeTrays, stockAdjust)
      await load()
    },
    [date, load],
  )

  const saveMany = useCallback(
    async (entries: { breadKey: string; boxIn: number; bakeTrays: number; stockAdjust: number }[]) => {
      for (const entry of entries) {
        await upsertRecord(date, entry.breadKey, entry.boxIn, entry.bakeTrays, entry.stockAdjust)
      }
      await load()
    },
    [date, load],
  )

  return { rows, loading, error, reload: load, save, saveMany }
}
