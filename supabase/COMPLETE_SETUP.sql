-- ==============================================================================
-- CAMPUSONE IIIT RANCHI: COMPLETE CONSOLIDATED SUPABASE DATABASE SETUP
-- ==============================================================================
-- Run this entire script in your Supabase Project:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click "Run"
--
-- This script is completely idempotent (safe to run multiple times).
-- It configures:
-- 1. All necessary database tables with constraints and indexes
-- 2. Grants privileges to 'anon' and 'authenticated' roles
-- 3. Row Level Security (RLS) policies for secure data governance
-- 4. Automatic profile sync trigger from auth.users (handle_new_user)
-- 5. Role escalation prevention trigger (protects admin/faculty roles)
-- 6. Helper RPC functions (increment_participants, is_admin, is_staff_or_admin)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. SCHEMA PRIVILEGES
grant usage on schema public to anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. USERS TABLE & RLS
-- ------------------------------------------------------------------------------
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null default 'student' check (role in ('student', 'faculty', 'guest', 'organizer', 'admin')),
  department text,
  year text,
  roll_number text,
  position text,
  phone text,
  address text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users policies
drop policy if exists "Users are viewable by everyone" on public.users;
create policy "Users are viewable by everyone"
  on public.users for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on table public.users to authenticated;
grant select on table public.users to anon;

-- ------------------------------------------------------------------------------
-- 4. ROLE GOVERNANCE & PROFILE AUTO-SYNC TRIGGERS
-- ------------------------------------------------------------------------------

-- Helper: Check if active user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Helper: Check if active user is staff or admin
create or replace function public.is_staff_or_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid()
      and role in ('admin', 'faculty', 'organizer')
  );
end;
$$ language plpgsql security definer;

-- Prevent users from escalating their own role to 'admin' or 'faculty'
create or replace function public.prevent_user_role_escalation()
returns trigger as $$
begin
  if (old.role is distinct from new.role) then
    if not public.is_admin() then
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_user_role_escalation on public.users;
create trigger trg_prevent_user_role_escalation
  before update on public.users
  for each row
  execute function public.prevent_user_role_escalation();

-- Trigger: Automatically create / update public.users row on auth.users registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, department, year, roll_number, position)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'position'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name),
    role = coalesce(excluded.role, public.users.role),
    department = coalesce(excluded.department, public.users.department),
    year = coalesce(excluded.year, public.users.year),
    roll_number = coalesce(excluded.roll_number, public.users.roll_number),
    position = coalesce(excluded.position, public.users.position);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. EVENTS TABLE & RLS
-- ------------------------------------------------------------------------------
create table if not exists public.events (
  id bigint generated by default as identity primary key,
  title text not null,
  description text not null,
  long_description text,
  image text not null default '/placeholder.svg?height=300&width=500',
  date timestamptz not null,
  end_date timestamptz,
  location text not null,
  address text,
  category text not null,
  other_category_details text,
  tags text[] not null default '{}',
  organizer text not null,
  lead_organizer text,
  convener text,
  coordinator text,
  contact_number text,
  registration_link text,
  is_paid boolean not null default false,
  price numeric(10,2),
  max_participants integer not null default 100,
  current_participants integer not null default 0,
  user_id uuid references auth.users(id) on delete set null,
  needs_volunteers boolean not null default false,
  volunteer_roles text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

drop policy if exists "Authenticated users can create events" on public.events;
create policy "Authenticated users can create events"
  on public.events for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Event organizers can update their events" on public.events;
create policy "Event organizers can update their events"
  on public.events for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Event organizers can delete their events" on public.events;
create policy "Event organizers can delete their events"
  on public.events for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

grant select, insert, update, delete on table public.events to authenticated;
grant select on table public.events to anon;

-- ------------------------------------------------------------------------------
-- 6. REGISTRATIONS TABLE & RPC
-- ------------------------------------------------------------------------------
create table if not exists public.registrations (
  id bigint generated by default as identity primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  registration_date timestamptz not null default now(),
  payment_status text check (payment_status in ('pending', 'completed')),
  payment_id text,
  is_volunteer boolean not null default false,
  volunteer_role text,
  created_at timestamptz not null default now(),
  constraint unique_event_user_registration unique (event_id, user_id)
);

alter table public.registrations enable row level security;

drop policy if exists "Users can view their own registrations or event creators view registrations" on public.registrations;
create policy "Users can view their own registrations or event creators view registrations"
  on public.registrations for select
  to authenticated
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.events
      where events.id = registrations.event_id
        and events.user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can register for events" on public.registrations;
create policy "Authenticated users can register for events"
  on public.registrations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can cancel their own registrations" on public.registrations;
create policy "Users can cancel their own registrations"
  on public.registrations for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

grant select, insert, update, delete on table public.registrations to authenticated;
grant select on table public.registrations to anon;

-- RPC to increment event participants safely
create or replace function public.increment_participants(event_id bigint)
returns void as $$
begin
  update public.events
  set current_participants = coalesce(current_participants, 0) + 1
  where id = event_id;
end;
$$ language plpgsql security definer;

-- ------------------------------------------------------------------------------
-- 7. CLUBS TABLE & RLS
-- ------------------------------------------------------------------------------
create table if not exists public.clubs (
  id bigint generated by default as identity primary key,
  name text not null,
  code text unique,
  category text not null default 'Technical' check (category in ('Technical', 'Cultural', 'Sports', 'Literary', 'Social')),
  description text not null,
  lead_name text not null,
  lead_email text,
  meeting_info text,
  image text not null default '/placeholder.svg?height=300&width=500',
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.clubs enable row level security;
drop policy if exists "Clubs are viewable by everyone" on public.clubs;
create policy "Clubs are viewable by everyone" on public.clubs for select using (true);
drop policy if exists "Staff can manage clubs" on public.clubs;
create policy "Staff can manage clubs" on public.clubs for all to authenticated using (public.is_staff_or_admin());

grant select on table public.clubs to anon, authenticated;
grant insert, update, delete on table public.clubs to authenticated;

-- ------------------------------------------------------------------------------
-- 8. INTERNSHIPS & PLACEMENTS
-- ------------------------------------------------------------------------------
create table if not exists public.internships (
  id bigint generated by default as identity primary key,
  title text not null,
  company text not null,
  role_type text not null default 'Software Development',
  stipend text not null,
  location text not null,
  deadline timestamptz not null,
  eligibility text not null,
  description text not null,
  apply_link text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.internships enable row level security;
drop policy if exists "Internships viewable by everyone" on public.internships;
create policy "Internships viewable by everyone" on public.internships for select using (true);
drop policy if exists "Staff can manage internships" on public.internships;
create policy "Staff can manage internships" on public.internships for all to authenticated using (public.is_staff_or_admin());

grant select on table public.internships to anon, authenticated;
grant insert, update, delete on table public.internships to authenticated;

create table if not exists public.placements (
  id bigint generated by default as identity primary key,
  company text not null,
  role text not null,
  ctc text not null,
  eligibility text not null,
  drive_date timestamptz not null,
  location text not null default 'IIIT Ranchi Campus / Virtual',
  description text not null,
  apply_link text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.placements enable row level security;
drop policy if exists "Placements viewable by everyone" on public.placements;
create policy "Placements viewable by everyone" on public.placements for select using (true);
drop policy if exists "Staff can manage placements" on public.placements;
create policy "Staff can manage placements" on public.placements for all to authenticated using (public.is_staff_or_admin());

grant select on table public.placements to anon, authenticated;
grant insert, update, delete on table public.placements to authenticated;

-- ------------------------------------------------------------------------------
-- 9. NOTICES & ANNOUNCEMENTS
-- ------------------------------------------------------------------------------
create table if not exists public.notices (
  id bigint generated by default as identity primary key,
  title text not null,
  content text not null,
  department text not null default 'Academic Affairs',
  priority text not null default 'Normal' check (priority in ('High', 'Medium', 'Normal')),
  notice_type text not null default 'college' check (notice_type in ('college', 'hostel')),
  target_audience text not null default 'All Students',
  file_url text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;
drop policy if exists "Notices viewable by everyone" on public.notices;
create policy "Notices viewable by everyone" on public.notices for select using (true);
drop policy if exists "Staff can manage notices" on public.notices;
create policy "Staff can manage notices" on public.notices for all to authenticated using (public.is_staff_or_admin());

grant select on table public.notices to anon, authenticated;
grant insert, update, delete on table public.notices to authenticated;

create table if not exists public.announcements (
  id bigint generated by default as identity primary key,
  title text not null,
  content text not null,
  category text not null default 'General',
  urgent boolean not null default false,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
drop policy if exists "Announcements viewable by everyone" on public.announcements;
create policy "Announcements viewable by everyone" on public.announcements for select using (true);
drop policy if exists "Staff can manage announcements" on public.announcements;
create policy "Staff can manage announcements" on public.announcements for all to authenticated using (public.is_staff_or_admin());

grant select on table public.announcements to anon, authenticated;
grant insert, update, delete on table public.announcements to authenticated;

-- ------------------------------------------------------------------------------
-- 10. CAMPUS SERVICES: LOST & FOUND, MARKETPLACE, GALLERY
-- ------------------------------------------------------------------------------
create table if not exists public.lost_found_items (
  id bigint generated by default as identity primary key,
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  date timestamptz not null default now(),
  contact text not null,
  status text not null default 'open' check (status in ('open', 'claimed', 'resolved')),
  image text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.lost_found_items enable row level security;
drop policy if exists "Lost found viewable by everyone" on public.lost_found_items;
create policy "Lost found viewable by everyone" on public.lost_found_items for select using (true);
drop policy if exists "Authenticated users can post lost found" on public.lost_found_items;
create policy "Authenticated users can post lost found" on public.lost_found_items for insert to authenticated with check (true);
drop policy if exists "Creator or admin can update lost found" on public.lost_found_items;
create policy "Creator or admin can update lost found" on public.lost_found_items for update to authenticated using (auth.uid() = user_id or public.is_admin());

grant select on table public.lost_found_items to anon, authenticated;
grant insert, update, delete on table public.lost_found_items to authenticated;

create table if not exists public.marketplace_items (
  id bigint generated by default as identity primary key,
  title text not null,
  description text not null,
  price numeric(10,2) not null,
  category text not null,
  condition text not null check (condition in ('New', 'Like New', 'Good', 'Fair')),
  contact text not null,
  status text not null default 'available' check (status in ('available', 'sold')),
  image text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.marketplace_items enable row level security;
drop policy if exists "Marketplace items viewable by everyone" on public.marketplace_items;
create policy "Marketplace items viewable by everyone" on public.marketplace_items for select using (true);
drop policy if exists "Authenticated users can post marketplace items" on public.marketplace_items;
create policy "Authenticated users can post marketplace items" on public.marketplace_items for insert to authenticated with check (true);
drop policy if exists "Owner or admin can update marketplace items" on public.marketplace_items;
create policy "Owner or admin can update marketplace items" on public.marketplace_items for update to authenticated using (auth.uid() = user_id or public.is_admin());

grant select on table public.marketplace_items to anon, authenticated;
grant insert, update, delete on table public.marketplace_items to authenticated;

create table if not exists public.gallery_images (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,
  category text not null default 'Campus',
  event_name text,
  image_url text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;
drop policy if exists "Gallery images viewable by everyone" on public.gallery_images;
create policy "Gallery images viewable by everyone" on public.gallery_images for select using (true);
drop policy if exists "Staff can manage gallery images" on public.gallery_images;
create policy "Staff can manage gallery images" on public.gallery_images for all to authenticated using (public.is_staff_or_admin());

grant select on table public.gallery_images to anon, authenticated;
grant insert, update, delete on table public.gallery_images to authenticated;

-- ------------------------------------------------------------------------------
-- 11. HOSTEL COMPLAINTS TABLE & RLS
-- ------------------------------------------------------------------------------
create table if not exists public.hostel_complaints (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  hostel_block text not null check (hostel_block in ('Hostel A', 'Hostel B', 'Hostel C', 'Girls Hostel', 'Other')),
  room_number text not null,
  category text not null check (category in ('Electrical', 'Plumbing', 'Carpentry', 'Internet/Wi-Fi', 'Cleanliness', 'Mess', 'Other')),
  title text not null,
  description text not null,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved', 'Rejected')),
  rejection_reason text,
  resolution_notes text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hostel_complaints enable row level security;

drop policy if exists "Students view their own complaints, staff views all" on public.hostel_complaints;
create policy "Students view their own complaints, staff views all"
  on public.hostel_complaints for select
  to authenticated
  using (auth.uid() = user_id or public.is_staff_or_admin());

drop policy if exists "Students can submit complaints" on public.hostel_complaints;
create policy "Students can submit complaints"
  on public.hostel_complaints for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Students can cancel open complaints" on public.hostel_complaints;
create policy "Students can cancel open complaints"
  on public.hostel_complaints for delete
  to authenticated
  using ((auth.uid() = user_id and status = 'Open') or public.is_admin());

drop policy if exists "Staff can update complaint status" on public.hostel_complaints;
create policy "Staff can update complaint status"
  on public.hostel_complaints for update
  to authenticated
  using (public.is_staff_or_admin() or auth.uid() = user_id)
  with check (public.is_staff_or_admin() or (auth.uid() = user_id and status = 'Open'));

grant select, insert, update, delete on table public.hostel_complaints to authenticated;
grant select on table public.hostel_complaints to anon;

-- Auto-update timestamp trigger
create or replace function public.update_hostel_complaint_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_hostel_complaint_timestamp on public.hostel_complaints;
create trigger trg_hostel_complaint_timestamp
  before update on public.hostel_complaints
  for each row
  execute function public.update_hostel_complaint_timestamp();

-- ------------------------------------------------------------------------------
-- 12. SEQUENCE PRIVILEGES
-- ------------------------------------------------------------------------------
grant usage, select on all sequences in schema public to anon, authenticated;

-- ==============================================================================
-- END OF SETUP
-- ==============================================================================
