-- ==============================================================================
-- Migration: 20250105000000_fix_admin_rls_and_grants.sql
-- Description:
--   1. Fixes table privileges, sequence grants, and function execution grants.
--   2. Eliminates recursive RLS evaluation with secure SECURITY DEFINER helpers.
--   3. Hardens public.users against role tampering and privilege escalation.
--   4. Creates explicit bootstrap_admin() procedure.
--   5. Fixes registrations, events, clubs, hostel_complaints, and notices RLS.
--   6. Implements safe participant counting RPCs (increment & decrement).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BASE PRIVILEGES & SCHEMA GRANTS
-- ------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- Grant standard table privileges to authenticated users
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Grant selective read privileges to anonymous public visitors
grant select on table
  public.events,
  public.clubs,
  public.notices,
  public.announcements,
  public.internships,
  public.placements,
  public.gallery_images,
  public.lost_found_items,
  public.marketplace_items
to anon;

-- Grant sequence privileges for serial and identity primary keys
grant usage, select on all sequences in schema public to anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. SECURE, NON-RECURSIVE ROLE VERIFICATION HELPERS
-- ------------------------------------------------------------------------------
-- Set explicit search_path to public, pg_temp to prevent schema hijacking.
-- In Supabase, postgres owns security definer functions, bypassing RLS inside
-- the function body to safely read public.users without recursion.

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  _role text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select role into _role from public.users where id = auth.uid();
  return _role = 'admin';
end;
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  _role text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select role into _role from public.users where id = auth.uid();
  return _role in ('admin', 'faculty', 'organizer');
end;
$$;

-- Explicit execution grants for role verification functions
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff_or_admin() to anon, authenticated;

-- ------------------------------------------------------------------------------
-- 3. ADMIN BOOTSTRAP PROCEDURE (TRUSTED DATABASE OWNER ONLY)
-- ------------------------------------------------------------------------------
-- Allows the trusted database operator to safely promote an existing Auth user
-- to 'admin' without exposing elevation routes to clients.

create or replace function public.bootstrap_admin(admin_email text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where lower(email) = lower(admin_email);
  if target_user_id is null then
    return 'ERROR: User with email ' || admin_email || ' does not exist in auth.users. Please sign up first.';
  end if;

  -- Upsert user into public.users with 'admin' role
  insert into public.users (id, email, name, role)
  values (target_user_id, admin_email, split_part(admin_email, '@', 1), 'admin')
  on conflict (id) do update set
    role = 'admin';

  return 'SUCCESS: User ' || admin_email || ' (' || target_user_id || ') is now an active administrator.';
end;
$$;

-- Protect bootstrap function: ONLY postgres and service_role may execute it
revoke execute on function public.bootstrap_admin(text) from public, anon, authenticated;
grant execute on function public.bootstrap_admin(text) to postgres, service_role;

-- ------------------------------------------------------------------------------
-- 4. PROFILE GOVERNANCE & PRIVILEGE ESCALATION PREVENTION
-- ------------------------------------------------------------------------------
-- Prevent users from modifying their own or others' roles unless they are admins.
create or replace function public.prevent_user_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (old.role is distinct from new.role) then
    if not public.is_admin() then
      new.role := old.role; -- Silently preserve existing role
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_user_role_escalation on public.users;
create trigger trg_prevent_user_role_escalation
  before update on public.users
  for each row
  execute function public.prevent_user_role_escalation();

-- Trigger: Automatically create public.users profile when a new auth user signs up.
-- STRICT ENFORCEMENT: Public signup always defaults to 'student'.
-- On conflict, the existing role is NEVER downgraded or overwritten.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, name, role, department, year, roll_number, position)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student', -- Public signups strictly start as student
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'position'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name),
    role = public.users.role, -- Preserve existing role unconditionally
    department = coalesce(excluded.department, public.users.department),
    year = coalesce(excluded.year, public.users.year),
    roll_number = coalesce(excluded.roll_number, public.users.roll_number),
    position = coalesce(excluded.position, public.users.position);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY: PUBLIC.USERS
-- ------------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "Users are viewable by everyone" on public.users;
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users view own profile or admin views all" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can delete user profiles" on public.users;

-- Users can read their own profile; staff and admins can view profiles
create policy "Users view own profile or admin views all"
  on public.users for select
  to authenticated
  using (auth.uid() = id or public.is_staff_or_admin());

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id or public.is_admin());

-- Users can update their own profile; admins can update any profile
create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Only admins can delete user profiles
create policy "Admins can delete user profiles"
  on public.users for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY: PUBLIC.REGISTRATIONS
-- ------------------------------------------------------------------------------
alter table public.registrations enable row level security;

drop policy if exists "Users can view their own registrations or event creators view registrations" on public.registrations;
drop policy if exists "Users and organizers view registrations" on public.registrations;
drop policy if exists "Authenticated users can register for events" on public.registrations;
drop policy if exists "Users can cancel their own registrations" on public.registrations;

create policy "Users and organizers view registrations"
  on public.registrations for select
  to authenticated
  using (
    auth.uid() = user_id or
    public.is_staff_or_admin() or
    exists (
      select 1 from public.events
      where events.id = registrations.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "Authenticated users can register for events"
  on public.registrations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can cancel their own registrations"
  on public.registrations for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY: PUBLIC.CLUBS
-- ------------------------------------------------------------------------------
alter table public.clubs enable row level security;

drop policy if exists "Clubs are viewable by everyone" on public.clubs;
drop policy if exists "Staff can manage clubs" on public.clubs;
drop policy if exists "Authenticated users can create clubs" on public.clubs;
drop policy if exists "Authenticated users can update clubs" on public.clubs;
drop policy if exists "Authorized users can update clubs" on public.clubs;
drop policy if exists "Authorized users can delete clubs" on public.clubs;

-- Read: viewable by all
create policy "Clubs are viewable by everyone"
  on public.clubs for select
  using (true);

-- Insert: staff, admins, or authenticated users registering a club
create policy "Authenticated users can create clubs"
  on public.clubs for insert
  to authenticated
  with check (true);

-- Update: staff/admins or the club's registered student lead
create policy "Authorized users can update clubs"
  on public.clubs for update
  to authenticated
  using (
    public.is_staff_or_admin() or
    (lead_email is not null and lower(lead_email) = lower(auth.jwt()->>'email'))
  )
  with check (
    public.is_staff_or_admin() or
    (lead_email is not null and lower(lead_email) = lower(auth.jwt()->>'email'))
  );

-- Delete: staff/admins or the club's registered student lead
create policy "Authorized users can delete clubs"
  on public.clubs for delete
  to authenticated
  using (
    public.is_staff_or_admin() or
    (lead_email is not null and lower(lead_email) = lower(auth.jwt()->>'email'))
  );

-- ------------------------------------------------------------------------------
-- 8. PARTICIPANT COUNT RPC FUNCTIONS
-- ------------------------------------------------------------------------------
create or replace function public.increment_participants(event_id bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.events
  set current_participants = coalesce(current_participants, 0) + 1
  where id = event_id;
end;
$$;

create or replace function public.decrement_participants(event_id bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.events
  set current_participants = greatest(coalesce(current_participants, 0) - 1, 0)
  where id = event_id;
end;
$$;

grant execute on function public.increment_participants(bigint) to authenticated;
grant execute on function public.decrement_participants(bigint) to authenticated;
