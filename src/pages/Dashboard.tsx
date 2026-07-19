import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDayData } from '../lib/useDayData'
import { getBread, formatStock } from '../lib/breads'
import type { WarningTier } from '../lib/types'
import { WARNING_TEXT_CLASS, WARNING_BADGE_CLASS } from '../lib/warningStyle'
import { useI18n } from '../lib/i18n'

type DetailKind = 'bake' | 'in' | 'stock' | 'warning' | null

const TIER_ORDER: Exclude<WarningTier, null>[] = ['day1', 'day2', 'day3']

export default function Dashboard() {
  const { rows, loading, error } = useDayData()
  const { t } = useI18n()
  const [detail, setDetail] = useState<DetailKind>(null)

  if (loading) return <p className="text-slate-500">{t('loading')}</p>
  if (error) return <p className="text-red-600">{t('error_prefix')}{error}</p>

  const units: [string, string, string] = [t('unit_box'), t('unit_bag'), t('unit_tray')]
  const breadName = (key: string) => t(`bread_${key}`)

  const totalBake = rows.reduce((sum, r) => sum + r.bakeTrays, 0)
  const totalBoxIn = rows.reduce((sum, r) => sum + r.boxIn, 0)
  const totalStock = rows.reduce((sum, r) => sum + r.stockTrays, 0)
  const warnings = rows.filter((r) => r.warningTier)
  const restockList = rows.filter((r) => r.restockBoxes > 0)

  const toggleDetail = (kind: DetailKind) => setDetail((prev) => (prev === kind ? null : kind))

  const cards: { kind: Exclude<DetailKind, null>; label: string; value: string | number; warn?: boolean }[] = [
    { kind: 'bake', label: t('card_bake'), value: totalBake },
    { kind: 'in', label: t('card_in'), value: totalBoxIn },
    { kind: 'stock', label: t('card_stock'), value: totalStock },
    { kind: 'warning', label: t('card_warning'), value: t('warning_kinds', { n: warnings.length }), warn: warnings.length > 0 },
  ]

  const detailTitles: Record<Exclude<DetailKind, null>, string> = {
    bake: t('detail_bake_title'),
    in: t('detail_in_title'),
    stock: t('detail_stock_title'),
    warning: t('detail_warning_title'),
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.kind}
            onClick={() => toggleDetail(card.kind)}
            className={`bg-white rounded-lg border p-4 text-left transition-colors ${
              detail === card.kind ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${card.warn ? 'text-red-600' : 'text-slate-800'}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('tap_detail')}</div>
          </button>
        ))}
      </div>

      {detail && (
        <section className="bg-white rounded-lg border border-amber-300 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">{detailTitles[detail]}</h2>
          {detail === 'warning' ? (
            warnings.length === 0 ? (
              <p className="text-sm text-slate-500">{t('no_warning')}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {warnings.map((r) => (
                  <li key={r.key} className="py-2 flex flex-wrap items-center justify-between gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      {breadName(r.key)}
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${WARNING_BADGE_CLASS[r.warningTier!]}`}>
                        {t(`tier_${r.warningTier}`)}
                      </span>
                    </span>
                    <span className={WARNING_TEXT_CLASS[r.warningTier!]}>
                      {t('warning_detail', {
                        stock: formatStock(r.stockTrays, getBread(r.key), units),
                        bake: r.latestBake,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <li key={r.key} className="py-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{breadName(r.key)}</span>
                    <span className="text-slate-600">
                      {detail === 'bake' && t('n_trays', { n: r.bakeTrays })}
                      {detail === 'in' && t('n_boxes', { n: r.boxIn })}
                      {detail === 'stock' && formatStock(r.stockTrays, getBread(r.key), units)}
                    </span>
                  </li>
                ))}
              </ul>
              {detail === 'bake' && (
                <p className="mt-3 pt-2 border-t border-slate-200 text-sm font-semibold text-slate-800">
                  {t('detail_total', { n: totalBake })}
                </p>
              )}
              {detail === 'stock' && (
                <p className="mt-3 pt-2 border-t border-slate-200 text-sm font-semibold text-slate-800">
                  {t('detail_total', { n: totalStock })}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <section className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">{t('card_warning')}</h2>
          <Link to="/inventory" className="text-sm text-amber-700 hover:underline">
            {t('go_input')}
          </Link>
        </div>
        {warnings.length === 0 ? (
          <p className="text-sm text-slate-500">{t('no_warning')}</p>
        ) : (
          <div className="space-y-4">
            {TIER_ORDER.map((tier) => {
              const items = warnings.filter((r) => r.warningTier === tier)
              if (items.length === 0) return null
              return (
                <div key={tier}>
                  <h3 className={`text-sm font-semibold mb-1 ${WARNING_TEXT_CLASS[tier]}`}>
                    {t(`tier_${tier}`)}（{t('warning_kinds', { n: items.length })}）
                  </h3>
                  <ul className="divide-y divide-slate-100">
                    {items.map((r) => (
                      <li key={r.key} className="py-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{breadName(r.key)}</span>
                        <span className={WARNING_TEXT_CLASS[tier]}>
                          {t('warning_detail', {
                            stock: formatStock(r.stockTrays, getBread(r.key), units),
                            bake: r.latestBake,
                          })}
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
        <h2 className="font-semibold text-slate-800 mb-3">{t('restock_section')}</h2>
        {restockList.length === 0 ? (
          <p className="text-sm text-slate-500">{t('no_restock')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {restockList.map((r) => (
              <li key={r.key} className="py-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{breadName(r.key)}</span>
                <span className="text-amber-700">{t('restock_suggest', { n: r.restockBoxes })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
