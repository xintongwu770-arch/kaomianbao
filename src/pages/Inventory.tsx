import { useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'
import { useDayData } from '../lib/useDayData'
import { adjustStock, fetchRecordsForDate, todayStr } from '../lib/api'
import { getBread, formatStock } from '../lib/breads'
import Stepper from '../components/Stepper'
import { WARNING_ROW_CLASS, WARNING_TEXT_CLASS, WARNING_BADGE_CLASS } from '../lib/warningStyle'
import { useI18n } from '../lib/i18n'

interface Edit {
  boxIn: number
  bakeTrays: number
}

export default function Inventory() {
  const { rows, loading, error, saveMany, reload } = useDayData()
  const { t } = useI18n()
  const [edits, setEdits] = useState<Record<string, Edit>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  // 推荐烤量确认流程：先预览，确认后才填入；填入后可撤回
  const [showRecommendPreview, setShowRecommendPreview] = useState(false)
  const [undoSnapshot, setUndoSnapshot] = useState<Record<string, Edit> | null>(null)
  // 修改库存：当前正在编辑哪个面包，输入的总盘数
  const [stockEditKey, setStockEditKey] = useState<string | null>(null)
  const [stockEditValue, setStockEditValue] = useState('')

  const units: [string, string, string] = [t('unit_box'), t('unit_bag'), t('unit_tray')]
  const breadName = (key: string) => t(`bread_${key}`)

  useEffect(() => {
    if (!loading && rows.length && Object.keys(edits).length === 0) {
      const seed: Record<string, Edit> = {}
      for (const r of rows) {
        seed[r.key] = { boxIn: r.boxIn, bakeTrays: r.bakeTrays }
      }
      setEdits(seed)
    }
  }, [loading, rows, edits])

  const updateEdit = (key: string, field: keyof Edit, value: number) => {
    setEdits((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const copyYesterdayBake = async () => {
    const yesterday = format(subDays(new Date(todayStr()), 1), 'yyyy-MM-dd')
    const yesterdayRecords = await fetchRecordsForDate(yesterday)
    setEdits((prev) => {
      const next = { ...prev }
      for (const r of rows) {
        const yr = yesterdayRecords[r.key]
        next[r.key] = {
          ...next[r.key],
          bakeTrays: yr?.bake_trays ?? 0,
        }
      }
      return next
    })
    setMessage(t('msg_copied'))
  }

  const confirmFillRecommended = () => {
    setUndoSnapshot(structuredClone(edits))
    setEdits((prev) => {
      const next = { ...prev }
      for (const r of rows) {
        next[r.key] = { ...next[r.key], bakeTrays: Math.round(r.avg7) }
      }
      return next
    })
    setShowRecommendPreview(false)
    setMessage(t('msg_filled'))
  }

  const undoFill = () => {
    if (!undoSnapshot) return
    setEdits(undoSnapshot)
    setUndoSnapshot(null)
    setMessage(t('msg_undone'))
  }

  const saveAll = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const entries = rows.map((r) => ({
        breadKey: r.key,
        boxIn: edits[r.key]?.boxIn ?? 0,
        bakeTrays: edits[r.key]?.bakeTrays ?? 0,
        stockAdjust: r.stockAdjust,
      }))
      await saveMany(entries)
      setMessage(t('msg_saved'))
    } catch (e) {
      setMessage(t('msg_save_failed', { err: e instanceof Error ? e.message : String(e) }))
    } finally {
      setSaving(false)
    }
  }

  const startStockEdit = (key: string, currentTrays: number) => {
    setStockEditKey(key)
    setStockEditValue(String(currentTrays))
  }

  const confirmStockEdit = async () => {
    if (!stockEditKey) return
    const newTotal = Number(stockEditValue)
    if (!Number.isFinite(newTotal) || newTotal < 0) return
    const key = stockEditKey
    try {
      const { oldTrays, newTrays } = await adjustStock(todayStr(), key, Math.round(newTotal))
      setStockEditKey(null)
      setMessage(t('msg_adjusted', { name: breadName(key), old: oldTrays, new: newTrays }))
      await reload()
    } catch (e) {
      setMessage(t('msg_adjust_failed', { err: e instanceof Error ? e.message : String(e) }))
    }
  }

  if (loading) return <p className="text-slate-500">{t('loading')}</p>
  if (error) return <p className="text-red-600">{t('error_prefix')}{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-800 text-lg">{t('inventory_title', { date: todayStr() })}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyYesterdayBake}
            className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {t('copy_yesterday')}
          </button>
          <button
            onClick={() => setShowRecommendPreview(true)}
            className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {t('fill_recommend')}
          </button>
          {undoSnapshot && (
            <button
              onClick={undoFill}
              className="text-sm px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
            >
              {t('undo_fill')}
            </button>
          )}
        </div>
      </div>

      {showRecommendPreview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-amber-900">{t('recommend_preview_title')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
            {rows.map((r) => {
              const recommended = Math.round(r.avg7)
              const current = edits[r.key]?.bakeTrays ?? 0
              return (
                <div key={r.key} className="flex justify-between">
                  <span className="text-slate-700">{breadName(r.key)}</span>
                  <span className={recommended !== current ? 'font-semibold text-amber-800' : 'text-slate-500'}>
                    {current} → {recommended}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-amber-800">{t('recommend_note')}</p>
          <div className="flex gap-2">
            <button
              onClick={confirmFillRecommended}
              className="text-sm px-4 py-1.5 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              {t('confirm_fill')}
            </button>
            <button
              onClick={() => setShowRecommendPreview(false)}
              className="text-sm px-4 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-amber-700">{message}</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2">{t('th_bread')}</th>
              <th className="px-3 py-2">{t('th_in')}</th>
              <th className="px-3 py-2">{t('th_bake')}</th>
              <th className="px-3 py-2">{t('th_stock')}</th>
              <th className="px-3 py-2">{t('th_avg')}</th>
              <th className="px-3 py-2">{t('th_restock')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const bread = getBread(r.key)
              const rowClass = r.warningTier ? WARNING_ROW_CLASS[r.warningTier] : ''
              const stockClass = r.warningTier ? WARNING_TEXT_CLASS[r.warningTier] : 'text-slate-700'
              const isEditingStock = stockEditKey === r.key
              return (
                <tr key={r.key} className={rowClass}>
                  <td className="px-3 py-2 font-medium text-slate-700 align-top">
                    <div>{breadName(r.key)}</div>
                    <div className="text-xs text-slate-400">{t('conv_note', { n: r.traysPerBag })}</div>
                    {r.warningTier && (
                      <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${WARNING_BADGE_CLASS[r.warningTier]}`}>
                        {t(`tier_${r.warningTier}`)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Stepper
                      value={edits[r.key]?.boxIn ?? 0}
                      onChange={(v) => updateEdit(r.key, 'boxIn', v)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Stepper
                      value={edits[r.key]?.bakeTrays ?? 0}
                      onChange={(v) => updateEdit(r.key, 'bakeTrays', v)}
                    />
                  </td>
                  <td className={`px-3 py-2 font-semibold whitespace-nowrap ${stockClass}`}>
                    {isEditingStock ? (
                      <span className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          autoFocus
                          className="w-20 border border-amber-400 rounded px-2 py-1 font-normal"
                          placeholder={t('edit_stock_prompt')}
                          value={stockEditValue}
                          onChange={(e) => setStockEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmStockEdit()
                            if (e.key === 'Escape') setStockEditKey(null)
                          }}
                        />
                        <span className="text-xs text-slate-400 font-normal">{t('unit_tray')}</span>
                        <button
                          onClick={confirmStockEdit}
                          className="text-xs px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                        >
                          {t('confirm')}
                        </button>
                        <button
                          onClick={() => setStockEditKey(null)}
                          className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          {t('cancel')}
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {formatStock(r.stockTrays, bread, units)}
                        <button
                          onClick={() => startStockEdit(r.key, r.stockTrays)}
                          className="text-xs px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 font-normal hover:bg-slate-100"
                        >
                          {t('edit_stock')}
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{r.avg7.toFixed(1)}</td>
                  <td className="px-3 py-2 text-amber-700">
                    {r.restockBoxes > 0 ? t('restock_short', { n: r.restockBoxes }) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveAll}
        disabled={saving}
        className="px-4 py-2 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
      >
        {saving ? t('saving') : t('save_btn')}
      </button>
    </div>
  )
}
