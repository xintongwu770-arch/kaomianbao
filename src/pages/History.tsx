import { useEffect, useState } from 'react'
import { fetchHistoryDates, fetchRecordsForDate } from '../lib/api'
import { BREADS, formatStock } from '../lib/breads'
import type { DailyRecord } from '../lib/types'

export default function History() {
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dayRecords, setDayRecords] = useState<Record<string, DailyRecord>>({})
  const [dayLoading, setDayLoading] = useState(false)

  useEffect(() => {
    fetchHistoryDates()
      .then(setDates)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (date: string) => {
    if (expanded === date) {
      setExpanded(null)
      return
    }
    setExpanded(date)
    setDayLoading(true)
    try {
      const records = await fetchRecordsForDate(date)
      setDayRecords(records)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDayLoading(false)
    }
  }

  if (loading) return <p className="text-slate-500">加载中…</p>
  if (error) return <p className="text-red-600">出错了：{error}</p>
  if (dates.length === 0) return <p className="text-slate-500">还没有历史记录。</p>

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-slate-800 text-lg">历史记录</h2>
      {dates.map((date) => (
        <div key={date} className="bg-white rounded-lg border border-slate-200">
          <button
            onClick={() => toggle(date)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-medium text-slate-700">{date}</span>
            <span className="text-slate-400 text-sm">{expanded === date ? '收起 ▲' : '展开 ▼'}</span>
          </button>
          {expanded === date && (
            <div className="border-t border-slate-100 overflow-x-auto">
              {dayLoading ? (
                <p className="p-4 text-sm text-slate-500">加载中…</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-left">
                    <tr>
                      <th className="px-3 py-2">面包</th>
                      <th className="px-3 py-2">入库（箱）</th>
                      <th className="px-3 py-2">烤量（盘）</th>
                      <th className="px-3 py-2">结算库存</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {BREADS.map((b) => {
                      const rec = dayRecords[b.key]
                      return (
                        <tr key={b.key}>
                          <td className="px-3 py-2 font-medium text-slate-700">{b.name}</td>
                          <td className="px-3 py-2">{rec?.box_in ?? '—'}</td>
                          <td className="px-3 py-2">{rec?.bake_trays ?? '—'}</td>
                          <td className="px-3 py-2">{rec ? formatStock(rec.stock_trays, b) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
