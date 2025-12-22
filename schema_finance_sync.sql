
-- 1. Add 'status' column to project_measurements if it doesn't exist
alter table public.project_measurements 
add column if not exists status text default 'Solicitada';

-- 2. Create financial_records table
create table if not exists public.financial_records (
  id uuid default uuid_generate_v4() primary key,
  project_id bigint references projects(id) on delete cascade not null,
  description text not null,
  type text not null check (type in ('Custo', 'Receita')),
  amount numeric not null,
  date date not null,
  measurement_id uuid references project_measurements(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS for financial_records
alter table public.financial_records enable row level security;

-- 4. RLS Policies for financial_records
do $$ begin
  drop policy if exists "Financial records viewable by auth users" on public.financial_records;
  drop policy if exists "Financial records insertable by auth users" on public.financial_records;
  drop policy if exists "Financial records updatable by auth users" on public.financial_records;
  drop policy if exists "Financial records deletable by auth users" on public.financial_records;
end $$;

create policy "Financial records viewable by auth users" on public.financial_records for select using (auth.role() = 'authenticated');
create policy "Financial records insertable by auth users" on public.financial_records for insert with check (auth.role() = 'authenticated');
create policy "Financial records updatable by auth users" on public.financial_records for update using (auth.role() = 'authenticated');
create policy "Financial records deletable by auth users" on public.financial_records for delete using (auth.role() = 'authenticated');

-- 5. Create Trigger Function to sync Measurements -> Financial Records
create or replace function public.sync_measurement_to_finance()
returns trigger as $$
begin
    -- Case 1: Status changed TO 'Faturada'
    -- Create a Revenue record
    if NEW.status = 'Faturada' and (OLD.status is null or OLD.status <> 'Faturada') then
        insert into public.financial_records (project_id, description, type, amount, date, measurement_id)
        values (
            NEW.project_id,
            'Faturamento Medição: ' || NEW.item_name,
            'Receita',
            NEW.total_price,
            NEW.measurement_date,
            NEW.id
        );
    end if;

    -- Case 2: Status changed FROM 'Faturada' to something else (Reversal)
    -- Delete the associated Revenue record
    if OLD.status = 'Faturada' and NEW.status <> 'Faturada' then
        delete from public.financial_records
        where measurement_id = NEW.id;
    end if;
    
    -- Case 3: Measurement Deleted (if it was Faturada)
    -- This is handled by TG_OP check or foreign key 'on delete set null' (checking logic)
    -- Actually, if measurement is deleted, we might want to keep the record or delete it?
    -- Requirement says "Reversals (Un-invoicing)" which implies status change. 
    -- If measurement is hard deleted, we probably want to delete the finance record too usually, 
    -- but for now let's stick to Status Change requirement.

    return NEW;
end;
$$ language plpgsql security definer;

-- 6. Create Trigger
drop trigger if exists on_measurement_status_change on public.project_measurements;
create trigger on_measurement_status_change
after update on public.project_measurements
for each row execute procedure public.sync_measurement_to_finance();
