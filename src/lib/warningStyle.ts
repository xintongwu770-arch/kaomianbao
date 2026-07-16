import type { WarningTier } from './types'

export const WARNING_LABELS: Record<Exclude<WarningTier, null>, string> = {
  day1: '不够用一天',
  day2: '不够用两天',
  day3: '还够用三天',
}

// day1 最紧急（红），day2 中等（橙），day3 提醒（黄）
export const WARNING_ROW_CLASS: Record<Exclude<WarningTier, null>, string> = {
  day1: 'bg-red-50',
  day2: 'bg-orange-50',
  day3: 'bg-yellow-50',
}

export const WARNING_TEXT_CLASS: Record<Exclude<WarningTier, null>, string> = {
  day1: 'text-red-600',
  day2: 'text-orange-600',
  day3: 'text-yellow-700',
}

export const WARNING_BADGE_CLASS: Record<Exclude<WarningTier, null>, string> = {
  day1: 'bg-red-100 text-red-700',
  day2: 'bg-orange-100 text-orange-700',
  day3: 'bg-yellow-100 text-yellow-800',
}
