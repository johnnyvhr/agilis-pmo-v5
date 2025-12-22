
-- 1. Create project_measurements table
-- Note: project_id is set to bigint to match the projects table primary key type.
create table if not exists public.project_measurements (
  id uuid default uuid_generate_v4() primary key,
  project_id bigint references projects(id) on delete cascade not null,
  item_name text not null,
  quantity numeric not null,
  unit text,
  unit_price numeric,
  total_price numeric,
  measurement_date date,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.project_measurements enable row level security;

-- 3. Create RLS Policies
do $$ begin
  drop policy if exists "Measurements are viewable by authenticated users." on public.project_measurements;
  drop policy if exists "Authenticated users can insert measurements." on public.project_measurements;
  drop policy if exists "Authenticated users can update measurements." on public.project_measurements;
  drop policy if exists "Authenticated users can delete measurements." on public.project_measurements;
end $$;

create policy "Measurements are viewable by authenticated users." 
on public.project_measurements for select 
using (auth.role() = 'authenticated');

create policy "Authenticated users can insert measurements." 
on public.project_measurements for insert 
with check (auth.role() = 'authenticated');

create policy "Authenticated users can update measurements." 
on public.project_measurements for update 
using (auth.role() = 'authenticated');

create policy "Authenticated users can delete measurements." 
on public.project_measurements for delete 
using (auth.role() = 'authenticated');
