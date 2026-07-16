import { useCallback, useEffect, useState } from 'react'
import { BREADS, traysPerBox } from './breads'
import type { BreadDayView, WarningTier } from './types'
import {
  average,
  fetchLatestStockBefore,
  fetchRecentBakeTrays,
  fetchRecordsForDate,
  todayStr,
  upsertRecord,
} from './api'

function computeWarningTier(stockTrays: number, avg7: number): WarningTier {
  if (avg7 <= 0) return null
  const daysCoverage = stockTrays / avg7
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
          const [stockBefore, recentBakes] = await Promise.all([
            fetchLatestStockBefore(bread.key, date),
            fetchRecentBakeTrays(bread.key, date, 7),
          ])
          const avg7 = average(recentBakes)
          const existing = todayRecords[bread.key]
          const boxIn = existing?.box_in ?? 0
          const bakeTrays = existing?.bake_trays ?? 0
          const stockTrays = existing ? existing.stock_trays : stockBefore
          const warningTier = computeWarningTier(stockTrays, avg7)
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
            avg7,
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
    async (breadKey: string, boxIn: number, bakeTrays: number) => {
      await upsertRecord(date, breadKey, boxIn, bakeTrays)
      await load()
    },
    [date, load],
  )

  const saveMany = useCallback(
    async (entries: { breadKey: string; boxIn: number; bakeTrays: number }[]) => {
      for (const entry of entries) {
        await upsertRecord(date, entry.breadKey, entry.boxIn, entry.bakeTrays)
      }
      await load()
    },
    [date, load],
  )

  return { rows, loading, error, reload: load, save, saveMany }
}
