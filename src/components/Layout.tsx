import { NavLink, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/inventory', label: '库存管理' },
  { to: '/history', label: '历史记录' },
  { to: '/stats', label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">🍞 烤面包库存系统</h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 text-center border-b border-red-200">
          尚未配置 Supabase 连接，数据无法保存。请在 .env 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">
        烤面包库存系统 · 第一阶段
      </footer>
    </div>
  )
}
