-- 盘点修改库存功能所需的表结构变更
-- 在 Supabase 项目的 SQL Editor 里执行一次即可（可以重复执行不会报错）

alter table daily_records add column if not exists stock_adjust integer not null default 0;

create table if not exists stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  record_date date not null,
  bread_key text not null,
  old_trays integer not null,
  new_trays integer not null,
  created_at timestamptz not null default now()
);

create index if not exists stock_adjustments_date_idx
  on stock_adjustments (record_date desc);

alter table stock_adjustments enable row level security;

drop policy if exists "anyone can read stock_adjustments" on stock_adjustments;
create policy "anyone can read stock_adjustments"
  on stock_adjustments for select
  using (true);

drop policy if exists "anyone can insert stock_adjustments" on stock_adjustments;
create policy "anyone can insert stock_adjustments"
  on stock_adjustments for insert
  with check (true);
