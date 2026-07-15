export interface Bread {
  key: string
  name: string
  traysPerBag: number
}

// 大葱 1袋=3盘，其余 1袋=2盘
export const BREADS: Bread[] = [
  { key: 'tudou', name: '土豆', traysPerBag: 2 },
  { key: 'hongshu', name: '红薯', traysPerBag: 2 },
  { key: 'dacong', name: '大葱', traysPerBag: 3 },
  { key: 'nangua', name: '南瓜', traysPerBag: 2 },
  { key: 'banli', name: '板栗', traysPerBag: 2 },
  { key: 'dasuan', name: '大蒜', traysPerBag: 2 },
  { key: 'yangcong', name: '洋葱', traysPerBag: 2 },
  { key: 'shizi', name: '柿子', traysPerBag: 2 },
  { key: 'yumi', name: '玉米', traysPerBag: 2 },
  { key: 'lajiao', name: '辣椒', traysPerBag: 2 },
  { key: 'heisongtudou', name: '黑松土豆', traysPerBag: 2 },
  { key: 'boluo', name: '菠萝', traysPerBag: 2 },
]

export function getBread(key: string): Bread {
  const bread = BREADS.find((b) => b.key === key)
  if (!bread) throw new Error(`Unknown bread key: ${key}`)
  return bread
}
