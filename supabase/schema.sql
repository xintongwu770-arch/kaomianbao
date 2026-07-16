-- 在 Supabase 项目的 SQL Editor 中执行这个文件来创建数据表

create table if not exists daily_records (
  id uuid primary key default gen_random_uuid(),
  record_date date not null,
  bread_key text not null,
  box_in integer not null default 0, -- 今日入库（箱，1箱=4袋）
  bake_trays integer not null default 0, -- 今日烤量（盘）
  stock_trays integer not null default 0, -- 结算库存（盘，内部最小单位，显示时换算成 箱+袋+盘）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (record_date, bread_key)
);

create index if not exists daily_records_bread_date_idx
  on daily_records (bread_key, record_date desc);

-- 第一阶段不做登录，任何拿到链接的人都可以读写数据（团队内部使用）
alter table daily_records enable row level security;

drop policy if exists "anyone can read daily_records" on daily_records;
create policy "anyone can read daily_records"
  on daily_records for select
  using (true);

drop policy if exists "anyone can insert daily_records" on daily_records;
create policy "anyone can insert daily_records"
  on daily_records for insert
  with check (true);

drop policy if exists "anyone can update daily_records" on daily_records;
create policy "anyone can update daily_records"
  on daily_records for update
  using (true);

drop policy if exists "anyone can delete daily_records" on daily_records;
create policy "anyone can delete daily_records"
  on daily_records for delete
  using (true);
