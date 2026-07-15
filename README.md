# 烤面包程序 · 库存管理系统

面包店（面团/半成品）库存管理网页：录入每日入库和烤量，自动计算库存、预警和补货建议，任何人拿到链接即可打开使用。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS v4
- Supabase（数据库）
- Vercel（部署）

## 核心规则

- 12 种面包：土豆、红薯、大葱、南瓜、板栗、大蒜、洋葱、柿子、玉米、辣椒、黑松土豆、菠萝
- 单位换算：大葱 1 袋 = 3 盘，其余 1 袋 = 2 盘
- 库存公式：**今日库存 = 昨日库存 + 今日入库(袋→盘) − 今日烤量(盘)**
- 预警：库存 < 最近 7 天平均烤量 → 标红
- 补货建议：补到能用 3 天（按最近 7 天平均烤量计算），换算成"需要补几袋"

## 本地开发

1. 复制 `.env.example` 为 `.env`，填入你的 Supabase 项目信息：

   ```
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的anon key
   ```

2. 在 Supabase 项目的 SQL Editor 中执行 [`supabase/schema.sql`](supabase/schema.sql) 建表。

3. 安装依赖并启动：

   ```bash
   npm install
   npm run dev
   ```

## 部署

推送到 GitHub 后，在 Vercel 中导入本仓库，添加环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，即可一键部署。

## 数据访问说明

第一阶段没有登录功能，任何拿到部署链接的人都可以查看和修改数据，请只把链接分享给需要使用的人。登录、云同步、多店管理、权限管理等功能计划在后续阶段加入。
