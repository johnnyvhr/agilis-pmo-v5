-- Drop previous definition if exists (careful in production, but needed here for schematic correction)
drop table if exists public.organization_settings;

-- Create table with UUID and new column names
create table public.organization_settings (
  id uuid not null default uuid_generate_v4() primary key,
  name text not null default 'Minha Empresa',
  url_slug text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.organization_settings enable row level security;

-- Policies
create policy "Allow read access for all authenticated users"
on public.organization_settings for select
using (auth.role() = 'authenticated');

create policy "Allow update access for Admins only"
on public.organization_settings for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Insert default row check (so the app has data to load)
insert into public.organization_settings (name, url_slug)
select 'Minha Empresa', 'minha-empresa'
where not exists (select 1 from public.organization_settings);
