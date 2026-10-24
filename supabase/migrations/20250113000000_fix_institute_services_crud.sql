-- ==============================================================================
-- Migration: 20250113000000_fix_institute_services_crud.sql
-- Description: Idempotent CRUD & RLS repair for Institute Services module:
--              1. lost_found_items (preserves working select/insert, adds update/delete)
--              2. marketplace_items (select, insert, update, delete for owner/admin)
--              3. gallery_images (select, insert, update, delete for owner/admin)
--              4. hostel_complaints (preserves student privacy; owner withdraw, staff manage/delete)
--              5. notices (public read; staff/admin publish, edit, delete)
-- ==============================================================================

-- 1. Helper Security Definer Functions
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

grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_staff_or_admin() to anon, authenticated, service_role;

-- 2. Table Grants & Privacy Controls
grant select on table 
  public.lost_found_items,
  public.marketplace_items,
  public.gallery_images,
  public.notices
to anon, authenticated;

grant insert, update, delete on table 
  public.lost_found_items,
  public.marketplace_items,
  public.gallery_images,
  public.notices,
  public.hostel_complaints
to authenticated;

-- Ensure sensitive student grievances are completely shielded from unauthenticated visitors
revoke all on table public.hostel_complaints from anon;

-- Ensure sequences are usable by authenticated users for primary keys
grant usage, select on all sequences in schema public to authenticated;

-- 3. Lost & Found Items (Preserve existing working SELECT and INSERT policies)
alter table public.lost_found_items enable row level security;

-- Ensure public select exists if not already present
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'lost_found_items' and cmd = 'SELECT'
  ) then
    create policy "lost_found_select_policy" on public.lost_found_items
      for select using (true);
  end if;
end $$;

drop policy if exists "lost_found_update_policy" on public.lost_found_items;
create policy "lost_found_update_policy" on public.lost_found_items
  for update to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin())
  with check ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

drop policy if exists "lost_found_delete_policy" on public.lost_found_items;
create policy "lost_found_delete_policy" on public.lost_found_items
  for delete to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

-- 4. Campus Marketplace
alter table public.marketplace_items enable row level security;

drop policy if exists "marketplace_select_policy" on public.marketplace_items;
create policy "marketplace_select_policy" on public.marketplace_items
  for select using (true);

drop policy if exists "marketplace_insert_policy" on public.marketplace_items;
create policy "marketplace_insert_policy" on public.marketplace_items
  for insert to authenticated
  with check ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

drop policy if exists "marketplace_update_policy" on public.marketplace_items;
create policy "marketplace_update_policy" on public.marketplace_items
  for update to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin())
  with check ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

drop policy if exists "marketplace_delete_policy" on public.marketplace_items;
create policy "marketplace_delete_policy" on public.marketplace_items
  for delete to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

-- 5. Campus Gallery Images
alter table public.gallery_images enable row level security;

drop policy if exists "gallery_select_policy" on public.gallery_images;
create policy "gallery_select_policy" on public.gallery_images
  for select using (true);

drop policy if exists "gallery_insert_policy" on public.gallery_images;
create policy "gallery_insert_policy" on public.gallery_images
  for insert to authenticated
  with check ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

drop policy if exists "gallery_update_policy" on public.gallery_images;
create policy "gallery_update_policy" on public.gallery_images
  for update to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin())
  with check ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

drop policy if exists "gallery_delete_policy" on public.gallery_images;
create policy "gallery_delete_policy" on public.gallery_images
  for delete to authenticated
  using ((auth.uid() = user_id and user_id is not null) or public.is_staff_or_admin());

-- 6. Hostel Complaints (Strict student privacy; staff manage; owner withdraw)
alter table public.hostel_complaints enable row level security;

drop policy if exists "hostel_complaints_select_policy" on public.hostel_complaints;
create policy "hostel_complaints_select_policy" on public.hostel_complaints
  for select to authenticated
  using (public.is_staff_or_admin() or (auth.uid() = user_id and user_id is not null));

drop policy if exists "hostel_complaints_update_policy" on public.hostel_complaints;
create policy "hostel_complaints_update_policy" on public.hostel_complaints
  for update to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "hostel_complaints_delete_policy" on public.hostel_complaints;
create policy "hostel_complaints_delete_policy" on public.hostel_complaints
  for delete to authenticated
  using (
    public.is_staff_or_admin()
    or ((auth.uid() = user_id and user_id is not null) and status = 'Open')
  );

-- 7. Notices (College & Hostel Circulars)
alter table public.notices enable row level security;

drop policy if exists "notices_select_policy" on public.notices;
create policy "notices_select_policy" on public.notices
  for select using (true);

drop policy if exists "notices_insert_policy" on public.notices;
create policy "notices_insert_policy" on public.notices
  for insert to authenticated
  with check (public.is_staff_or_admin());

drop policy if exists "notices_update_policy" on public.notices;
create policy "notices_update_policy" on public.notices
  for update to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "notices_delete_policy" on public.notices;
create policy "notices_delete_policy" on public.notices
  for delete to authenticated
  using (public.is_staff_or_admin());

-- Reload schema cache in PostgREST
notify pgrst, 'reload schema';
