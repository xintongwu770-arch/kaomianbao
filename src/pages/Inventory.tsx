import { useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'
import { useDayData } from '../lib/useDayData'
import { fetchRecordsForDate, todayStr } from '../lib/api'
import { getBread, formatStock } from '../lib/breads'
import Stepper from '../components/Stepper'
import { WARNING_ROW_CLASS, WARNING_TEXT_CLASS, WARNING_LABELS, WARNING_BADGE_CLASS } from '../lib/warningStyle'

interface Edit {
  boxIn: number
  bakeTrays: number
}

export default function Inventory() {
  const { rows, loading, error, saveMany } = useDayData()
  const [edits, setEdits] = useState<Record<string, Edit>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
    setMessage('已复制昨天的烤量，记得检查后保存。')
  }

  const fillRecommended = () => {
    setEdits((prev) => {
      const next = { ...prev }
      for (const r of rows) {
        next[r.key] = { ...next[r.key], bakeTrays: Math.round(r.avg7) }
      }
      return next
    })
    setMessage('已填入近7日平均推荐烤量，记得检查后保存。')
  }

  const saveAll = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const entries = rows.map((r) => ({
        breadKey: r.key,
        boxIn: edits[r.key]?.boxIn ?? 0,
        bakeTrays: edits[r.key]?.bakeTrays ?? 0,
      }))
      await saveMany(entries)
      setMessage('保存成功。')
    } catch (e) {
      setMessage(`保存失败：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-500">加载中…</p>
  if (error) return <p className="text-red-600">出错了：{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-800 text-lg">今日库存录入（{todayStr()}）</h2>
        <div className="flex gap-2">
          <button
            onClick={copyYesterdayBake}
            className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            一键复制昨天烤量
          </button>
          <button
            onClick={fillRecommended}
            className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            填入近7日推荐烤量
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-amber-700">{message}</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2">面包</th>
              <th className="px-3 py-2">今日入库（箱）</th>
              <th className="px-3 py-2">今日烤量（盘）</th>
              <th className="px-3 py-2">当前库存</th>
              <th className="px-3 py-2">近7日均耗（盘）</th>
              <th className="px-3 py-2">补货建议</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const bread = getBread(r.key)
              const rowClass = r.warningTier ? WARNING_ROW_CLASS[r.warningTier] : ''
              const stockClass = r.warningTier ? WARNING_TEXT_CLASS[r.warningTier] : 'text-slate-700'
              return (
                <tr key={r.key} className={rowClass}>
                  <td className="px-3 py-2 font-medium text-slate-700 align-top">
                    <div>{r.name}</div>
                    <div className="text-xs text-slate-400">(1箱=4袋，1袋={r.traysPerBag}盘)</div>
                    {r.warningTier && (
                      <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${WARNING_BADGE_CLASS[r.warningTier]}`}>
                        {WARNING_LABELS[r.warningTier]}
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
                    {formatStock(r.stockTrays, bread)}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{r.avg7.toFixed(1)}</td>
                  <td className="px-3 py-2 text-amber-700">{r.restockBoxes > 0 ? `补 ${r.restockBoxes} 箱` : '—'}</td>
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
        {saving ? '保存中…' : '保存今日数据'}
      </button>
    </div>
  )
}
