import { Link } from 'react-router-dom'
import { useDayData } from '../lib/useDayData'
import { getBread, formatStock } from '../lib/breads'
import type { WarningTier } from '../lib/types'
import { WARNING_LABELS, WARNING_TEXT_CLASS } from '../lib/warningStyle'

function StatCard({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'warning' }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${tone === 'warning' ? 'text-red-600' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  )
}

const TIER_ORDER: Exclude<WarningTier, null>[] = ['day1', 'day2', 'day3']

export default function Dashboard() {
  const { rows, loading, error } = useDayData()

  if (loading) return <p className="text-slate-500">加载中…</p>
  if (error) return <p className="text-red-600">出错了：{error}</p>

  const totalBake = rows.reduce((sum, r) => sum + r.bakeTrays, 0)
  const totalBoxIn = rows.reduce((sum, r) => sum + r.boxIn, 0)
  const totalStock = rows.reduce((sum, r) => sum + r.stockTrays, 0)
  const warningCount = rows.filter((r) => r.warningTier).length
  const restockList = rows.filter((r) => r.restockBoxes > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="今日烤量（12种总计/盘）" value={totalBake} />
        <StatCard label="今日入库（箱数总计）" value={totalBoxIn} />
        <StatCard label="当前库存（盘）" value={totalStock} />
        <StatCard label="今日库存预警" value={`${warningCount} 种`} tone={warningCount > 0 ? 'warning' : 'default'} />
      </div>

      <section className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">今日库存预警</h2>
          <Link to="/inventory" className="text-sm text-amber-700 hover:underline">
            去录入今日数据 →
          </Link>
        </div>
        {warningCount === 0 ? (
          <p className="text-sm text-slate-500">暂无预警，库存充足。</p>
        ) : (
          <div className="space-y-4">
            {TIER_ORDER.map((tier) => {
              const items = rows.filter((r) => r.warningTier === tier)
              if (items.length === 0) return null
              return (
                <div key={tier}>
                  <h3 className={`text-sm font-semibold mb-1 ${WARNING_TEXT_CLASS[tier]}`}>
                    {WARNING_LABELS[tier]}（{items.length} 种）
                  </h3>
                  <ul className="divide-y divide-slate-100">
                    {items.map((r) => (
                      <li key={r.key} className="py-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{r.name}</span>
                        <span className={WARNING_TEXT_CLASS[tier]}>
                          库存 {formatStock(r.stockTrays, getBread(r.key))} · 近7日均耗 {r.avg7.toFixed(1)} 盘/天
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-3">今日补货建议（按可用3天计算）</h2>
        {restockList.length === 0 ? (
          <p className="text-sm text-slate-500">暂无需要补货的面包。</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {restockList.map((r) => (
              <li key={r.key} className="py-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{r.name}</span>
                <span className="text-amber-700">建议补 {r.restockBoxes} 箱</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
