-- ==============================================================================
-- CAMPUSONE SUPABASE VERIFICATION SCRIPT
-- ==============================================================================
-- Run this script in Supabase SQL Editor to verify:
-- 1. Table existence and Row Level Security (RLS) activation.
-- 2. Configured RLS policies for each table.
-- 3. Grants and privileges for 'authenticated' and 'anon' roles.
-- 4. Triggers protecting roles and auto-syncing profiles.
-- 5. Helper and RPC functions (is_admin, is_staff_or_admin, bootstrap_admin, etc.).
-- ==============================================================================

-- 1. VERIFY TABLES AND RLS STATUS
select 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_enforced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'users', 'events', 'registrations', 'clubs', 'notices',
    'announcements', 'hostel_complaints', 'internships',
    'placements', 'lost_found_items', 'marketplace_items', 'gallery_images'
  )
order by c.relname;

-- 2. VERIFY RLS POLICIES ACROSS ALL TABLES
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. VERIFY TABLE PRIVILEGES (GRANTS)
select 
  table_schema,
  table_name,
  grantee,
  string_agg(privilege_type, ', ') as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
group by table_schema, table_name, grantee
order by table_name, grantee;

-- 4. VERIFY SECURITY DEFINER FUNCTIONS AND SEARCH PATHS
select 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  p.proconfig as search_path_config,
  pg_get_function_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_admin',
    'is_staff_or_admin',
    'bootstrap_admin',
    'prevent_user_role_escalation',
    'handle_new_user',
    'increment_participants',
    'decrement_participants'
  )
order by p.proname;

-- 5. VERIFY DATABASE TRIGGERS
select 
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where (event_object_schema = 'public' and event_object_table = 'users')
   or (event_object_schema = 'auth' and event_object_table = 'users')
order by event_object_table, trigger_name;

-- 6. VERIFY ADMIN BOOTSTRAP EXECUTABILITY (SHOULD BE RESTRICTED)
select 
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'bootstrap_admin';
