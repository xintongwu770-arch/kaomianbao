import { NavLink, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { useI18n, type Lang } from '../lib/i18n'

const navItems = [
  { to: '/', key: 'nav_home' },
  { to: '/inventory', key: 'nav_inventory' },
  { to: '/history', key: 'nav_history' },
  { to: '/stats', key: 'nav_stats' },
]

const langOptions: { value: Lang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
]

export default function Layout() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-slate-800">{t('app_title')}</h1>
          <div className="flex items-center gap-2">
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
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
            <div className="flex rounded-md border border-slate-300 overflow-hidden text-sm">
              {langOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLang(opt.value)}
                  className={`px-2.5 py-1 ${
                    lang === opt.value
                      ? 'bg-slate-700 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 text-center border-b border-red-200">
          {t('not_configured')}
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">{t('footer')}</footer>
    </div>
  )
}
