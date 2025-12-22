
-- 1. Ensure Departments Table Exists
create table if not exists public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.departments enable row level security;

-- 3. RLS Policies
do $$ begin
  drop policy if exists "Departments are viewable by authenticated users." on departments;
  drop policy if exists "Authenticated users can insert departments." on departments;
  drop policy if exists "Authenticated users can update departments." on departments;
  drop policy if exists "Authenticated users can delete departments." on departments;
end $$;

create policy "Departments are viewable by authenticated users." on departments for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert departments." on departments for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update departments." on departments for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete departments." on departments for delete using (auth.role() = 'authenticated');

-- 4. Trigger Function for Cascading Updates
create or replace function public.handle_department_name_update()
returns trigger as $$
begin
    if OLD.name <> NEW.name then
        -- Update Tasks (column: dept)
        update public.tasks 
        set dept = NEW.name 
        where dept = OLD.name;
        
        -- Update Project Measurements (column: department)
        update public.project_measurements 
        set department = NEW.name 
        where department = OLD.name;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

-- 5. Create Trigger
drop trigger if exists on_department_update on public.departments;
create trigger on_department_update
after update on public.departments
for each row execute procedure public.handle_department_name_update();
