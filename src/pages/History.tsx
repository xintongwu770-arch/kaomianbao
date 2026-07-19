import { useEffect, useState } from 'react'
import { fetchAdjustmentsForDate, fetchHistoryDates, fetchRecordsForDate } from '../lib/api'
import { BREADS, formatStock } from '../lib/breads'
import type { DailyRecord, StockAdjustment } from '../lib/types'
import { useI18n } from '../lib/i18n'

export default function History() {
  const { t } = useI18n()
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dayRecords, setDayRecords] = useState<Record<string, DailyRecord>>({})
  const [dayAdjustments, setDayAdjustments] = useState<StockAdjustment[]>([])
  const [dayLoading, setDayLoading] = useState(false)

  const units: [string, string, string] = [t('unit_box'), t('unit_bag'), t('unit_tray')]
  const breadName = (key: string) => t(`bread_${key}`)

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
      const [records, adjustments] = await Promise.all([
        fetchRecordsForDate(date),
        fetchAdjustmentsForDate(date),
      ])
      setDayRecords(records)
      setDayAdjustments(adjustments)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDayLoading(false)
    }
  }

  if (loading) return <p className="text-slate-500">{t('loading')}</p>
  if (error) return <p className="text-red-600">{t('error_prefix')}{error}</p>
  if (dates.length === 0) return <p className="text-slate-500">{t('hist_none')}</p>

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-slate-800 text-lg">{t('hist_title')}</h2>
      {dates.map((date) => (
        <div key={date} className="bg-white rounded-lg border border-slate-200">
          <button
            onClick={() => toggle(date)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-medium text-slate-700">{date}</span>
            <span className="text-slate-400 text-sm">{expanded === date ? t('collapse') : t('expand')}</span>
          </button>
          {expanded === date && (
            <div className="border-t border-slate-100 overflow-x-auto">
              {dayLoading ? (
                <p className="p-4 text-sm text-slate-500">{t('loading')}</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                      <tr>
                        <th className="px-3 py-2">{t('th_bread')}</th>
                        <th className="px-3 py-2">{t('hist_in')}</th>
                        <th className="px-3 py-2">{t('hist_bake')}</th>
                        <th className="px-3 py-2">{t('hist_stock')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {BREADS.map((b) => {
                        const rec = dayRecords[b.key]
                        return (
                          <tr key={b.key}>
                            <td className="px-3 py-2 font-medium text-slate-700">{breadName(b.key)}</td>
                            <td className="px-3 py-2">{rec?.box_in ?? '—'}</td>
                            <td className="px-3 py-2">{rec?.bake_trays ?? '—'}</td>
                            <td className="px-3 py-2">{rec ? formatStock(rec.stock_trays, b, units) : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {dayAdjustments.length > 0 && (
                    <div className="border-t border-slate-100 px-3 py-2 bg-amber-50/50">
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">{t('adjust_log_title')}</h4>
                      <ul className="space-y-0.5">
                        {dayAdjustments.map((adj) => (
                          <li key={adj.id} className="text-xs text-slate-600">
                            {t('adjust_log_item', {
                              name: breadName(adj.bread_key),
                              old: adj.old_trays,
                              new: adj.new_trays,
                            })}
                            {adj.created_at && (
                              <span className="text-slate-400 ml-1">
                                ({new Date(adj.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
