/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'zh' | 'ja'

const translations: Record<Lang, Record<string, string>> = {
  zh: {
    app_title: '🍞 烤面包库存系统',
    nav_home: '首页',
    nav_inventory: '库存管理',
    nav_history: '历史记录',
    nav_stats: '统计',
    not_configured: '尚未配置 Supabase 连接，数据无法保存。请在 .env 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
    footer: '烤面包库存系统',
    loading: '加载中…',
    error_prefix: '出错了：',
    // 首页
    card_bake: '今日烤量（12种总计/盘）',
    card_in: '今日入库（箱数总计）',
    card_stock: '当前库存（盘）',
    card_warning: '今日库存预警',
    warning_kinds: '{n} 种',
    tap_detail: '点击查看明细',
    detail_bake_title: '今日烤量明细',
    detail_in_title: '今日入库明细',
    detail_stock_title: '当前库存明细',
    detail_warning_title: '预警明细',
    detail_total: '总量 {n} 盘',
    n_trays: '{n} 盘',
    n_boxes: '{n} 箱',
    go_input: '去录入今日数据 →',
    no_warning: '暂无预警，库存充足。',
    tier_day1: '不够用一天',
    tier_day2: '不够用两天',
    tier_day3: '还够用三天',
    warning_detail: '库存 {stock} · 最近烘烤日烤量 {bake} 盘',
    restock_section: '今日补货建议（按可用3天计算）',
    no_restock: '暂无需要补货的面包。',
    restock_suggest: '建议补 {n} 箱',
    restock_short: '补 {n} 箱',
    // 库存录入页
    inventory_title: '今日库存录入（{date}）',
    copy_yesterday: '一键复制昨天烤量',
    fill_recommend: '填入近7日推荐烤量',
    undo_fill: '撤回填入',
    recommend_preview_title: '推荐烤量预览（按近7日有烘烤日子的平均值）',
    recommend_note: '确认后会覆盖上面表格里当前的烤量数字（入库不受影响），填入后还可以撤回。',
    confirm_fill: '确认填入',
    cancel: '取消',
    confirm: '确认',
    msg_copied: '已复制昨天的烤量，记得检查后保存。',
    msg_filled: '已填入推荐烤量。如果填错了可以点"撤回填入"恢复，确认无误后记得保存。',
    msg_undone: '已撤回，烤量恢复为填入前的数值。',
    msg_saved: '保存成功。',
    msg_save_failed: '保存失败：{err}',
    save_btn: '保存今日数据',
    saving: '保存中…',
    th_bread: '面包',
    th_in: '今日入库（箱）',
    th_bake: '今日烤量（盘）',
    th_stock: '当前库存',
    th_avg: '近7日均耗（盘）',
    th_restock: '补货建议',
    conv_note: '(1箱=4袋，1袋={n}盘)',
    aria_dec: '减少',
    aria_inc: '增加',
    // 修改库存
    edit_stock: '修改库存',
    edit_stock_prompt: '盘点后的总盘数',
    msg_adjusted: '库存已修改：{name} {old} → {new} 盘，已记录盘点调整。',
    msg_adjust_failed: '修改库存失败：{err}',
    // 历史
    hist_title: '历史记录',
    hist_none: '还没有历史记录。',
    expand: '展开 ▼',
    collapse: '收起 ▲',
    hist_in: '入库（箱）',
    hist_bake: '烤量（盘）',
    hist_stock: '结算库存',
    adjust_log_title: '盘点调整记录',
    adjust_log_item: '{name}：{old} → {new} 盘',
    // 统计
    stats_title: '今日统计',
    stats_bake: '今日总烤量（盘）',
    stats_stock: '今日库存（盘）',
    stats_warning: '今日预警数量',
    stats_chart: '今日各口味烤量对比',
    stats_profit_note: '利润统计将在成本/单价数据准备好后加入。',
    chart_bake: '烤量',
    // 单位
    unit_box: '箱',
    unit_bag: '袋',
    unit_tray: '盘',
    // 面包名
    bread_tudou: '土豆',
    bread_hongshu: '红薯',
    bread_dacong: '大葱',
    bread_nangua: '南瓜',
    bread_banli: '板栗',
    bread_dasuan: '大蒜',
    bread_yangcong: '洋葱',
    bread_shizi: '柿子',
    bread_yumi: '玉米',
    bread_lajiao: '辣椒',
    bread_heisongtudou: '黑松土豆',
    bread_boluo: '菠萝',
  },
  ja: {
    app_title: '🍞 パン在庫管理システム',
    nav_home: 'ホーム',
    nav_inventory: '在庫管理',
    nav_history: '履歴',
    nav_stats: '統計',
    not_configured: 'Supabase が未設定のため、データを保存できません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。',
    footer: 'パン在庫管理システム',
    loading: '読み込み中…',
    error_prefix: 'エラー：',
    card_bake: '本日の焼成数（12種合計・トレー）',
    card_in: '本日の入庫（箱数合計）',
    card_stock: '現在の在庫（トレー）',
    card_warning: '本日の在庫アラート',
    warning_kinds: '{n} 種',
    tap_detail: 'タップで詳細を表示',
    detail_bake_title: '本日の焼成数の内訳',
    detail_in_title: '本日の入庫の内訳',
    detail_stock_title: '現在の在庫の内訳',
    detail_warning_title: 'アラートの内訳',
    detail_total: '合計 {n} トレー',
    n_trays: '{n} トレー',
    n_boxes: '{n} 箱',
    go_input: '本日のデータを入力 →',
    no_warning: 'アラートはありません。在庫は十分です。',
    tier_day1: '1日分に足りない',
    tier_day2: '2日分に足りない',
    tier_day3: 'あと3日分',
    warning_detail: '在庫 {stock} ・ 直近焼成日の焼成数 {bake} トレー',
    restock_section: '本日の補充提案（3日分を目安）',
    no_restock: '補充が必要なパンはありません。',
    restock_suggest: '{n} 箱の補充をおすすめ',
    restock_short: '{n} 箱補充',
    inventory_title: '本日の在庫入力（{date}）',
    copy_yesterday: '昨日の焼成数をコピー',
    fill_recommend: '直近7日のおすすめを入力',
    undo_fill: '入力を元に戻す',
    recommend_preview_title: 'おすすめ焼成数のプレビュー（直近7日の焼成日平均）',
    recommend_note: '確定すると表の焼成数が上書きされます（入庫は変わりません）。入力後は元に戻せます。',
    confirm_fill: '入力を確定',
    cancel: 'キャンセル',
    confirm: '確定',
    msg_copied: '昨日の焼成数をコピーしました。確認して保存してください。',
    msg_filled: 'おすすめ焼成数を入力しました。「入力を元に戻す」で戻せます。保存を忘れずに。',
    msg_undone: '元に戻しました。',
    msg_saved: '保存しました。',
    msg_save_failed: '保存に失敗しました：{err}',
    save_btn: '本日のデータを保存',
    saving: '保存中…',
    th_bread: 'パン',
    th_in: '本日の入庫（箱）',
    th_bake: '本日の焼成（トレー）',
    th_stock: '現在の在庫',
    th_avg: '直近7日平均（トレー）',
    th_restock: '補充提案',
    conv_note: '(1箱=4袋、1袋={n}トレー)',
    aria_dec: '減らす',
    aria_inc: '増やす',
    edit_stock: '在庫修正',
    edit_stock_prompt: '棚卸後の合計トレー数',
    msg_adjusted: '在庫を修正しました：{name} {old} → {new} トレー。棚卸調整を記録しました。',
    msg_adjust_failed: '在庫修正に失敗しました：{err}',
    hist_title: '履歴',
    hist_none: '履歴がまだありません。',
    expand: '開く ▼',
    collapse: '閉じる ▲',
    hist_in: '入庫（箱）',
    hist_bake: '焼成（トレー）',
    hist_stock: '在庫残',
    adjust_log_title: '棚卸調整の記録',
    adjust_log_item: '{name}：{old} → {new} トレー',
    stats_title: '本日の統計',
    stats_bake: '本日の総焼成数（トレー）',
    stats_stock: '本日の在庫（トレー）',
    stats_warning: '本日のアラート数',
    stats_chart: '本日のフレーバー別焼成数',
    stats_profit_note: '利益統計はコスト・単価データの準備後に追加されます。',
    chart_bake: '焼成数',
    unit_box: '箱',
    unit_bag: '袋',
    unit_tray: 'トレー',
    bread_tudou: 'ジャガイモ',
    bread_hongshu: 'サツマイモ',
    bread_dacong: '長ネギ',
    bread_nangua: 'カボチャ',
    bread_banli: '栗',
    bread_dasuan: 'ニンニク',
    bread_yangcong: 'タマネギ',
    bread_shizi: '柿',
    bread_yumi: 'トウモロコシ',
    bread_lajiao: '唐辛子',
    bread_heisongtudou: '黒トリュフポテト',
    bread_boluo: 'パイナップル',
  },
}

export type TFunc = (key: string, vars?: Record<string, string | number>) => string

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFunc
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'kaomianbao-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'ja' ? 'ja' : 'zh'
  })

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'ja' ? 'ja' : 'zh-CN'
  }, [lang])

  const t = useCallback<TFunc>(
    (key, vars) => {
      let text = translations[lang][key] ?? translations.zh[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v))
        }
      }
      return text
    },
    [lang],
  )

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
