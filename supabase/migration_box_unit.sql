-- 如果你的 Supabase 项目是之前建的（表里还是 bag_in 列），执行这个脚本迁移到新的箱单位
-- 在 SQL Editor 里执行一次即可

alter table daily_records rename column bag_in to box_in;
