import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDayData } from '../lib/useDayData'

export default function Stats() {
  const { rows, loading, error } = useDayData()

  if (loading) return <p className="text-slate-500">加载中…</p>
  if (error) return <p className="text-red-600">出错了：{error}</p>

  const totalBake = rows.reduce((sum, r) => sum + r.bakeTrays, 0)
  const totalStock = rows.reduce((sum, r) => sum + r.stockTrays, 0)
  const warningCount = rows.filter((r) => r.isWarning).length

  const chartData = [...rows]
    .sort((a, b) => b.bakeTrays - a.bakeTrays)
    .map((r) => ({ name: r.name, 烤量: r.bakeTrays }))

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-slate-800 text-lg">今日统计</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">今日总烤量（盘）</div>
          <div className="text-2xl font-semibold mt-1 text-slate-800">{totalBake}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">今日库存（盘）</div>
          <div className="text-2xl font-semibold mt-1 text-slate-800">{totalStock}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">今日预警数量</div>
          <div className={`text-2xl font-semibold mt-1 ${warningCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {warningCount} 种
          </div>
        </div>
      </div>

      <section className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">今日各口味烤量对比</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="烤量" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-xs text-slate-400">利润统计将在成本/单价数据准备好后加入。</p>
    </div>
  )
}
