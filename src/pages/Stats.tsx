import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDayData } from '../lib/useDayData'
import { useI18n } from '../lib/i18n'

export default function Stats() {
  const { rows, loading, error } = useDayData()
  const { t } = useI18n()

  if (loading) return <p className="text-slate-500">{t('loading')}</p>
  if (error) return <p className="text-red-600">{t('error_prefix')}{error}</p>

  const totalBake = rows.reduce((sum, r) => sum + r.bakeTrays, 0)
  const totalStock = rows.reduce((sum, r) => sum + r.stockTrays, 0)
  const warningCount = rows.filter((r) => r.warningTier).length

  const bakeKey = t('chart_bake')
  const chartData = [...rows]
    .sort((a, b) => b.bakeTrays - a.bakeTrays)
    .map((r) => ({ name: t(`bread_${r.key}`), [bakeKey]: r.bakeTrays }))

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-slate-800 text-lg">{t('stats_title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t('stats_bake')}</div>
          <div className="text-2xl font-semibold mt-1 text-slate-800">{totalBake}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t('stats_stock')}</div>
          <div className="text-2xl font-semibold mt-1 text-slate-800">{totalStock}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t('stats_warning')}</div>
          <div className={`text-2xl font-semibold mt-1 ${warningCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {t('warning_kinds', { n: warningCount })}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">{t('stats_chart')}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey={bakeKey} fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-xs text-slate-400">{t('stats_profit_note')}</p>
    </div>
  )
}
