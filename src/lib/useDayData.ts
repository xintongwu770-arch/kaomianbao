import { useCallback, useEffect, useState } from 'react'
import { BREADS } from './breads'
import type { BreadDayView } from './types'
import {
  average,
  fetchLatestStockBefore,
  fetchRecentBakeTrays,
  fetchRecordsForDate,
  todayStr,
  upsertRecord,
} from './api'

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
          const bagIn = existing?.bag_in ?? 0
          const bakeTrays = existing?.bake_trays ?? 0
          const stockTrays = existing ? existing.stock_trays : stockBefore
          const isWarning = avg7 > 0 && stockTrays < avg7
          const target = avg7 * 3
          const shortfall = Math.max(0, target - stockTrays)
          const restockBags = Math.ceil(shortfall / bread.traysPerBag)

          const view: BreadDayView = {
            key: bread.key,
            name: bread.name,
            traysPerBag: bread.traysPerBag,
            bagIn,
            bakeTrays,
            stockTrays,
            avg7,
            isWarning,
            restockBags,
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
    async (breadKey: string, bagIn: number, bakeTrays: number) => {
      await upsertRecord(date, breadKey, bagIn, bakeTrays)
      await load()
    },
    [date, load],
  )

  const saveMany = useCallback(
    async (entries: { breadKey: string; bagIn: number; bakeTrays: number }[]) => {
      for (const entry of entries) {
        await upsertRecord(date, entry.breadKey, entry.bagIn, entry.bakeTrays)
      }
      await load()
    },
    [date, load],
  )

  return { rows, loading, error, reload: load, save, saveMany }
}
