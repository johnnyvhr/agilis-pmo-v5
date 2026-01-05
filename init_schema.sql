-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. HELPER FUNCTIONS (RLS & Utilities)
CREATE OR REPLACE FUNCTION public.check_is_space_member(lookup_space_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM space_members
    WHERE space_id = lookup_space_id
    AND user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_default_space_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM spaces LIMIT 1;
$$;

-- 2. PROFILES (Global Users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Profiles Trigger for Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

alter table public.profiles enable row level security;

-- Policies for Profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON "public"."profiles";', r.policyname);
  END LOOP;
END $$;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 3. SPACES (Multi-Tenancy Root)
create table if not exists public.spaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.spaces enable row level security;

-- Spaces View Policy
drop policy if exists "Users can view spaces they belong to" on spaces;
drop policy if exists "view_spaces_membership_or_owner" on spaces;
create policy "view_spaces_membership_or_owner" 
  on spaces for select 
  using (
     owner_id = auth.uid() 
     OR
     exists (
        select 1 from space_members sm 
        where sm.space_id = spaces.id 
        and sm.user_id = auth.uid()
     )
  );

drop policy if exists "Users can create spaces" on spaces;
create policy "Users can create spaces" 
  on spaces for insert 
  with check (auth.role() = 'authenticated'); 

-- 4. SPACE MEMBERS (Many-to-Many User<->Space)
create table if not exists public.space_members (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member', -- 'owner', 'admin', 'member'
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(space_id, user_id)
);

alter table public.space_members enable row level security;

-- Clean Logic for Space Members RLS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'space_members' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON "public"."space_members";', r.policyname);
  END LOOP;
END $$;

-- A. SELECT: "I can see myself AND others in my space"
create policy "policy_select_team_visibility"
  on space_members for select
  using (
      user_id = auth.uid() 
      OR
      check_is_space_member(space_id)
  );

-- B. INSERT: "I can join" or be added
create policy "policy_insert_invites"
  on space_members for insert
  with check (user_id = auth.uid() OR check_is_space_member(space_id));

-- C. MODIFY: Admin capabilities (Update/Delete)
create policy "policy_modify_members"
  on space_members for update
  using (check_is_space_member(space_id));

create policy "policy_delete_members"
  on space_members for delete
  using (check_is_space_member(space_id));


-- 5. INVITATIONS (Smart Invite System)
create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  email text not null,
  token text unique not null,
  role text default 'member',
  expires_at timestamp with time zone not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invitations enable row level security;

drop policy if exists "Space admins can view/manage invitations" on invitations;
drop policy if exists "allow_insert_if_author" on invitations;

-- A. INSERT: Author-based permission (Unblocks 'orphaned' admins)
create policy "allow_insert_if_author"
  on invitations for insert
  with check ( auth.role() = 'authenticated' AND auth.uid() = created_by );

-- B. SELECT: Own Invites
drop policy if exists "view_own_invites" on invitations;
create policy "view_own_invites"
  on invitations for select
  using (created_by = auth.uid());

-- C. DELETE: Own Invites
drop policy if exists "delete_own_invites" on invitations;
create policy "delete_own_invites"
  on invitations for delete
  using (created_by = auth.uid());


-- 6. PROJECTS (Tenant Scoped)
create table if not exists public.projects (
  id bigint generated by default as identity primary key,
  space_id uuid references public.spaces(id) on delete cascade not null, -- TENANT KEY
  name text not null,
  description text,
  status text default 'Não Iniciado',
  start_date date,
  end_date date,
  budget numeric,
  manager_id uuid references public.profiles(id),
  manager_name text,
  priority text default 'Média',
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration: Ensure space_id exists on projects (if existing table)
alter table public.projects add column if not exists space_id uuid references public.spaces(id) on delete cascade;

alter table public.projects enable row level security;

drop policy if exists "Tenant Isolation: Projects" on projects;
create policy "Tenant Isolation: Projects" 
  on projects 
  using (
    exists (
      select 1 from space_members sm 
      where sm.space_id = projects.space_id 
      and sm.user_id = auth.uid()
    )
  );

-- 7. TEAMS (Tenant Scoped)
create table if not exists public.teams (
  id bigint generated by default as identity primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration: Ensure space_id exists on teams
alter table public.teams add column if not exists space_id uuid references public.spaces(id) on delete cascade;

alter table public.teams enable row level security;

drop policy if exists "Tenant Isolation: Teams" on teams;
create policy "Tenant Isolation: Teams" 
  on teams 
  using (
    exists (
      select 1 from space_members sm 
      where sm.space_id = teams.space_id 
      and sm.user_id = auth.uid()
    )
  );

-- 8. DEPARTMENTS (Tenant Scoped)
create table if not exists public.departments (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration: Ensure space_id exists on departments
alter table public.departments add column if not exists space_id uuid references public.spaces(id) on delete cascade;

alter table public.departments enable row level security;

drop policy if exists "Tenant Isolation: Departments" on departments;
create policy "Tenant Isolation: Departments" 
  on departments 
  using (
    exists (
      select 1 from space_members sm 
      where sm.space_id = departments.space_id 
      and sm.user_id = auth.uid()
    )
  );

-- 9. PROJECT SUB-ENTITIES (Tasks, Risks, etc.)
create table if not exists public.tasks (
  id bigint generated by default as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'Não Iniciada',
  priority text default 'Média',
  dept text,
  responsible text,
  planned_start date,
  planned_end date,
  planned_duration integer,
  percent_complete integer default 0,
  actual_start date,
  actual_end date,
  actual_duration integer,
  group_name text,
  predecessors jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

drop policy if exists "Tenant Isolation: Tasks" on tasks;
create policy "Tenant Isolation: Tasks" 
  on tasks 
  using (
    exists (
      select 1 from public.projects p
      join public.space_members sm on p.space_id = sm.space_id
      where p.id = tasks.project_id
      and sm.user_id = auth.uid()
    )
  );

-- Risks
create table if not exists public.risks (
  id bigint generated by default as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  description text not null,
  probability text,
  impact text,
  mitigation_plan text,
  status text,
  owner text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.risks enable row level security;

drop policy if exists "Tenant Isolation: Risks" on risks;
create policy "Tenant Isolation: Risks" 
  on risks 
  using (
    exists (
      select 1 from public.projects p
      join public.space_members sm on p.space_id = sm.space_id
      where p.id = risks.project_id
      and sm.user_id = auth.uid()
    )
  );

-- Quality Checks
create table if not exists public.quality_checks (
  id bigint generated by default as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  item text not null,
  criteria text,
  status text,
  checked_date date,
  responsible text,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quality_checks enable row level security;

drop policy if exists "Tenant Isolation: Quality Checks" on quality_checks;
create policy "Tenant Isolation: Quality Checks" 
  on quality_checks 
  using (
    exists (
      select 1 from public.projects p
      join public.space_members sm on p.space_id = sm.space_id
      where p.id = quality_checks.project_id
      and sm.user_id = auth.uid()
    )
  );

-- Measurements
create table if not exists public.project_measurements (
  id uuid default uuid_generate_v4() primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  item_name text not null,
  quantity numeric not null,
  unit text,
  unit_price numeric,
  total_price numeric,
  measurement_date date,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- Migration: Ensure created_by exists on measurements
alter table public.project_measurements add column if not exists created_by uuid references public.profiles(id);

alter table public.project_measurements enable row level security;

drop policy if exists "Tenant Isolation: Measurements" on project_measurements;
create policy "Tenant Isolation: Measurements" 
  on project_measurements 
  using (
    exists (
      select 1 from public.projects p
      join public.space_members sm on p.space_id = sm.space_id
      where p.id = project_measurements.project_id
      and sm.user_id = auth.uid()
    )
  );

-- 10. FUNCTIONS & TRIGGERS

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-Create Default Space for New Users (Optional)
create or replace function public.create_default_space()
returns trigger as $$
declare
  new_space_id uuid;
begin
  insert into public.spaces (name, slug, owner_id)
  values ('My Space', 'my-space-' || substr(md5(random()::text), 0, 8), new.id)
  returning id into new_space_id;

  insert into public.space_members (space_id, user_id, role)
  values (new_space_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

-- 11. RPC: ACCEPT INVITATION (FIXED)
CREATE OR REPLACE FUNCTION public.accept_invitation(token_input text)
RETURNS json AS $$
DECLARE
  invite_record record;
  current_auth_user_id uuid; -- Renamed from 'user_id' to avoid ambiguity
BEGIN
  -- Get current user
  current_auth_user_id := auth.uid();
  if current_auth_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Find valid invitation
  select * into invite_record
  from public.invitations
  where token = token_input
  and expires_at > now();

  if invite_record.id is null then
    return json_build_object('success', false, 'message', 'Invalid or expired token');
  end if;

  -- Verify if user is already a member
  if exists (
    select 1 
    from public.space_members sm 
    where sm.space_id = invite_record.space_id 
    and sm.user_id = current_auth_user_id
  ) then
     return json_build_object('success', false, 'message', 'User already in space');
  end if;

  -- Add to space_members
  insert into public.space_members (space_id, user_id, role)
  values (invite_record.space_id, current_auth_user_id, invite_record.role);

  -- Delete invitation (one-time use)
  delete from public.invitations where id = invite_record.id;

  return json_build_object('success', true, 'space_id', invite_record.space_id);
end;
$$ language plpgsql security definer;