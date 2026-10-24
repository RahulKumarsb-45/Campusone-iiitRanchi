-- ==============================================================================
-- CAMPUSONE IIIT RANCHI: VERIFICATION SCRIPT FOR MISSING SERVICE TABLES
-- File: supabase/verify_missing_service_tables.sql
-- Description: Run this SQL script in the Supabase Dashboard SQL Editor to verify:
--              1. All 6 missing tables exist in public schema.
--              2. Row Level Security (RLS) is enabled on all 6 tables.
--              3. Column definitions, types, nullability, and defaults match frontend requirements.
--              4. Check constraints and foreign keys are active.
--              5. Performance indexes exist.
--              6. Policies properly utilize public.is_admin() and auth.uid().
--              7. Table grants for anon and authenticated roles.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. VERIFY TABLE EXISTENCE & RLS STATUS (EXPECTED: 6 ROWS, ALL RLS = TRUE)
-- ------------------------------------------------------------------------------
select 
  c.relname as table_name,
  case when c.relrowsecurity then 'PASS: RLS Enabled' else 'FAIL: RLS Disabled' end as rls_status,
  case when c.relforcerowsecurity then 'FORCE RLS' else 'STANDARD RLS' end as rls_enforcement
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by c.relname;

-- ------------------------------------------------------------------------------
-- 2. VERIFY COLUMNS & DATA TYPES
-- ------------------------------------------------------------------------------
select 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by table_name, ordinal_position;

-- ------------------------------------------------------------------------------
-- 3. VERIFY FOREIGN KEYS (REFERENCES auth.users(id))
-- ------------------------------------------------------------------------------
select
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by tc.table_name;

-- ------------------------------------------------------------------------------
-- 4. VERIFY CHECK CONSTRAINTS
-- ------------------------------------------------------------------------------
select
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
from information_schema.table_constraints tc
join information_schema.check_constraints cc
  on tc.constraint_name = cc.constraint_name
where tc.table_schema = 'public'
  and tc.constraint_type = 'CHECK'
  and tc.table_name in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by tc.table_name, tc.constraint_name;

-- ------------------------------------------------------------------------------
-- 5. VERIFY INDEXES
-- ------------------------------------------------------------------------------
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by tablename, indexname;

-- ------------------------------------------------------------------------------
-- 6. VERIFY ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
select
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
order by tablename, policyname;

-- ------------------------------------------------------------------------------
-- 7. VERIFY TABLE PRIVILEGES (GRANTS)
-- ------------------------------------------------------------------------------
select
  table_name,
  grantee,
  string_agg(privilege_type, ', ' order by privilege_type) as granted_privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'internships',
    'placements',
    'hostel_complaints',
    'lost_found_items',
    'marketplace_items',
    'gallery_images'
  )
group by table_name, grantee
order by table_name, grantee;

-- ------------------------------------------------------------------------------
-- 8. COMPREHENSIVE STATUS SUMMARY
-- ------------------------------------------------------------------------------
select 
  t.table_name,
  case 
    when count(c.column_name) > 0 then 'EXISTS (' || count(c.column_name) || ' columns)'
    else 'MISSING'
  end as schema_status,
  case 
    when p.relrowsecurity then 'RLS ACTIVE'
    else 'NO RLS'
  end as security_status,
  (select count(*) from pg_policies pol where pol.schemaname = 'public' and pol.tablename = t.table_name) as policy_count
from (
  values 
    ('internships'),
    ('placements'),
    ('hostel_complaints'),
    ('lost_found_items'),
    ('marketplace_items'),
    ('gallery_images')
) as t(table_name)
left join information_schema.columns c
  on c.table_schema = 'public' and c.table_name = t.table_name
left join pg_class p
  on p.relname = t.table_name and p.relnamespace = (select oid from pg_namespace where nspname = 'public')
group by t.table_name, p.relrowsecurity
order by t.table_name;
