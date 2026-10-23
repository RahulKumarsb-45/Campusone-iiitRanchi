-- ==============================================================================
-- Migration: 20250106000000_fix_club_images.sql
-- Description:
--   1. Replaces generic/duplicate coding-laptop image URLs on existing clubs
--      with high-resolution, activity-specific images matching each club's
--      actual mission (Photography, Fine Arts, Sports, Literary, Cultural, etc.).
--   2. Updates column default on public.clubs.image.
--   3. Completely idempotent and preserves all existing club metadata.
-- ==============================================================================

-- 1. Piccell Club / Photography & Videography Clubs (even if categorized as Social)
update public.clubs
set image = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80'
where (
    lower(name) like '%piccell%' or
    lower(code) = 'PICCELL' or
    lower(description) like '%photograph%' or
    lower(description) like '%videograph%' or
    lower(description) like '%dslr%' or
    lower(description) like '%camera%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 2. Kriti Club / Fine Arts, Sketching & Painting Clubs
update public.clubs
set image = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80'
where (
    lower(name) like '%kriti%' or
    lower(code) = 'KRITI' or
    lower(description) like '%sketch%' or
    lower(description) like '%paint%' or
    lower(description) like '%drawing%' or
    lower(description) like '%canvas%' or
    lower(description) like '%fine art%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 3. Sports & Athletics Societies (Cricket, Football, Badminton, Track)
update public.clubs
set image = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80'
where (
    category = 'Sports' or
    lower(name) like '%sport%' or
    lower(code) = 'SPORTS' or
    lower(description) like '%cricket%' or
    lower(description) like '%football%' or
    lower(description) like '%athletics%' or
    lower(description) like '%badminton%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 4. Vibrance Cultural Society & Performing Arts (Dance, Music, Drama)
update public.clubs
set image = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80'
where (
    category = 'Cultural' or
    lower(name) like '%vibrance%' or
    lower(code) = 'VIBRANCE' or
    lower(description) like '%dance%' or
    lower(description) like '%music%' or
    lower(description) like '%drama%' or
    lower(description) like '%theatre%'
  )
  and lower(name) not like '%kriti%'
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 5. Literary & Debating Societies (Poetry, Model UN, Debates, Creative Writing)
update public.clubs
set image = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1000&q=80'
where (
    category = 'Literary' or
    lower(name) like '%literary%' or
    lower(name) like '%debate%' or
    lower(code) = 'LIT' or
    lower(description) like '%writing%' or
    lower(description) like '%poetry%' or
    lower(description) like '%debate%' or
    lower(description) like '%model un%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 6. E-Cell & Entrepreneurship Ventures
update public.clubs
set image = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80'
where (
    lower(name) like '%ecell%' or
    lower(name) like '%e-cell%' or
    lower(code) = 'ECELL' or
    lower(description) like '%startup%' or
    lower(description) like '%entrepreneur%' or
    lower(description) like '%venture%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 7. Robotics & IoT Club
update public.clubs
set image = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80'
where (
    lower(name) like '%robot%' or
    lower(code) = 'ROBO' or
    lower(description) like '%embedded%' or
    lower(description) like '%hardware%' or
    lower(description) like '%iot%' or
    lower(description) like '%circuit%'
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 8. House of Geeks / Technical Coding Club
update public.clubs
set image = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'
where (
    lower(name) like '%house of geeks%' or
    lower(code) = 'HOG' or
    (category = 'Technical' and lower(description) like '%coding%')
  )
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 9. Any remaining Social clubs (Community / NSS / Volunteering)
update public.clubs
set image = 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1000&q=80'
where category = 'Social'
  and lower(name) not like '%piccell%'
  and lower(name) not like '%ecell%'
  and (
    image is null or
    image = '' or
    image like '%photo-1517694712202%' or
    image like '%placeholder%'
  );

-- 10. Update column default to a modern programming visual rather than stale laptop URL
alter table public.clubs alter column image set default 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80';
