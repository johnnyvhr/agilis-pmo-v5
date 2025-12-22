
-- 1. Add 'created_by' column to project_measurements if it doesn't exist
alter table public.project_measurements 
add column if not exists created_by uuid references auth.users(id);

-- 2. Update status column default to 'Planejada' (if needed, but 'Solicitada' is also fine, let's stick to requirement 'Strict Options')
-- Re-apply 'status' column check just in case
alter table public.project_measurements 
add column if not exists status text default 'Planejada';

-- 3. Create or Replace Trigger Function (Refined Logic)
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

    -- Case 2: Status changed FROM 'Faturada' to 'Planejada' OR 'Solicitada'
    -- Delete the associated Revenue record
    if OLD.status = 'Faturada' and (NEW.status = 'Planejada' or NEW.status = 'Solicitada') then
        delete from public.financial_records
        where measurement_id = NEW.id;
    end if;

    return NEW;
end;
$$ language plpgsql security definer;

-- 4. Automatically set created_by on INSERT if not provided
create or replace function public.set_created_by()
returns trigger as $$
begin
  if NEW.created_by is null then
    NEW.created_by := auth.uid();
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- 5. Trigger for created_by
drop trigger if exists set_created_by_trigger on public.project_measurements;
create trigger set_created_by_trigger
before insert on public.project_measurements
for each row execute procedure public.set_created_by();
