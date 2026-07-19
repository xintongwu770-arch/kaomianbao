export interface Bread {
  key: string
  name: string
  traysPerBag: number
}

// 大葱 1袋=3盘，其余 1袋=2盘
export const BAGS_PER_BOX = 4 // 一箱 = 四袋（所有面包统一）

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

export function traysPerBox(bread: Bread): number {
  return bread.traysPerBag * BAGS_PER_BOX
}

export interface StockBreakdown {
  boxes: number
  bags: number
  trays: number
}

// 把总盘数换算成 箱+袋+盘，完全精确不丢数
export function breakdownStock(totalTrays: number, bread: Bread): StockBreakdown {
  const negative = totalTrays < 0
  const abs = Math.abs(totalTrays)
  const perBox = traysPerBox(bread)
  const boxes = Math.floor(abs / perBox)
  const remainderAfterBoxes = abs % perBox
  const bags = Math.floor(remainderAfterBoxes / bread.traysPerBag)
  const trays = remainderAfterBoxes % bread.traysPerBag
  const sign = negative ? -1 : 1
  return { boxes: sign * boxes, bags: sign * bags, trays: sign * trays }
}

// units: [箱, 袋, 盘] 的显示文字，默认中文；日文模式传入 ['箱','袋','トレー']
export function formatStock(
  totalTrays: number,
  bread: Bread,
  units: [string, string, string] = ['箱', '袋', '盘'],
): string {
  if (totalTrays < 0) return `-${formatStock(-totalTrays, bread, units)}`
  const { boxes, bags, trays } = breakdownStock(totalTrays, bread)
  return `${boxes}${units[0]}${bags}${units[1]}${trays}${units[2]}`
}
