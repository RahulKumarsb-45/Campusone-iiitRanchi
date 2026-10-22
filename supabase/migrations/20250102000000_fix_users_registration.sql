-- Migration: 20250102000000_fix_users_registration.sql
-- Grant table privileges and auto-create profile from auth.users signup metadata

-- 1. Table Grants
grant select, insert, update on table public.users to authenticated;
grant select on table public.users to anon;

-- 2. Trigger function to automatically create/sync profile on user registration
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

-- 3. Create Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
