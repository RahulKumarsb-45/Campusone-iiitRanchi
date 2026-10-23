-- ==============================================================================
-- Migration: 20250108000000_fix_registrations_permissions.sql
-- Description:
--   1. Fixes PostgreSQL 42501 permission denied for table public.registrations.
--   2. Explicitly grants SELECT, INSERT, UPDATE, DELETE to 'authenticated' role.
--   3. Explicitly revokes anon access on registrations to safeguard student data.
--   4. Refines is_admin() and is_staff_or_admin() to be strictly case-insensitive.
--   5. Establishes comprehensive, least-privilege RLS policies for registrations:
--      - SELECT: Users view own, organizers view for their events, admins view all.
--      - INSERT: Authenticated users register for themselves; staff/admins can register.
--      - UPDATE: Users update own details; staff/admins can manage registrations.
--      - DELETE: Users cancel only own registrations; admins can manage/cancel all.
--   6. Grants sequence access and reloads PostgREST schema cache.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BASE SCHEMA AND TABLE PERMISSIONS
-- ------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- Ensure public.registrations table has explicit grants for authenticated users
grant select, insert, update, delete on table public.registrations to authenticated;
grant all on table public.registrations to service_role;

-- Safeguard student privacy: anonymous unauthenticated visitors MUST NOT read registrations
revoke all on table public.registrations from anon;

-- Grant sequence privileges for identity and serial sequences
grant usage, select on all sequences in schema public to authenticated;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'S' and c.relname like 'registrations%seq' and n.nspname = 'public'
  ) then
    execute 'grant usage, select, update on all sequences in schema public to authenticated;';
  end if;
end;
$$;

-- ------------------------------------------------------------------------------
-- 2. CASE-INSENSITIVE ROLE VERIFICATION HELPERS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
-- Protects against case mismatches (e.g. 'Admin' vs 'admin' or leading/trailing whitespace)
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
  return lower(trim(coalesce(_role, ''))) = 'admin';
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
  return lower(trim(coalesce(_role, ''))) in ('admin', 'faculty', 'organizer');
end;
$$;

-- Grant execution to anon and authenticated roles
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_staff_or_admin() to anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) FOR PUBLIC.REGISTRATIONS
-- ------------------------------------------------------------------------------
alter table public.registrations enable row level security;

-- Drop all previous / legacy policy variants to ensure clean, non-conflicting rules
drop policy if exists "Users can view their own registrations or event creators view registrations" on public.registrations;
drop policy if exists "Users and organizers view registrations" on public.registrations;
drop policy if exists "Authenticated users can register for events" on public.registrations;
drop policy if exists "Users can cancel their own registrations" on public.registrations;
drop policy if exists "registrations_select_policy" on public.registrations;
drop policy if exists "registrations_insert_policy" on public.registrations;
drop policy if exists "registrations_update_policy" on public.registrations;
drop policy if exists "registrations_delete_policy" on public.registrations;

-- Policy 3.1: SELECT
-- - Authenticated users can fetch their own registrations (auth.uid() = user_id)
-- - Event organizers/owners can view registrations for events they created
-- - Admins and staff can view all registrations
create policy "registrations_select_policy"
  on public.registrations for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_staff_or_admin()
    or exists (
      select 1 from public.events
      where events.id = registrations.event_id
        and events.user_id = auth.uid()
    )
  );

-- Policy 3.2: INSERT
-- - Authenticated users can register themselves (auth.uid() = user_id)
-- - Staff and admins retain authorized capability to register attendees
create policy "registrations_insert_policy"
  on public.registrations for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or public.is_staff_or_admin()
  );

-- Policy 3.3: UPDATE
-- - Users can update their own registration fields (e.g. volunteer role, notes)
-- - Staff and admins can update payment status, volunteer assignment, etc.
create policy "registrations_update_policy"
  on public.registrations for update
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_staff_or_admin()
  )
  with check (
    auth.uid() = user_id
    or public.is_staff_or_admin()
  );

-- Policy 3.4: DELETE
-- - Students can cancel only their own registrations
-- - Admins retain full capability to manage/cancel any registration
create policy "registrations_delete_policy"
  on public.registrations for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 4. RELOAD POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
-- Instantly refreshes PostgREST metadata cache so new grants and policies take effect immediately
notify pgrst, 'reload schema';
