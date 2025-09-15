-- =============================================
-- Ziarazetu: Full & Corrected Database Migration
-- =============================================
-- This script is idempotent and safe to run multiple times.

-- =============================================
-- 1. Enable UUID extension
-- =============================================
/*
# [Operation] Enable pgcrypto for UUID generation
This extension is required to generate unique identifiers (UUIDs) for our primary keys.
## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/
create extension if not exists pgcrypto with schema extensions;

-- =============================================
-- 2. Create All Tables
-- =============================================

/*
# [Operation] Create profiles table
Stores user profile information, linked to Supabase's authentication users.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false
*/
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text default 'user',
  created_at timestamp with time zone default now()
);
comment on table public.profiles is 'Stores public user profile information linked to auth.users.';

/*
# [Operation] Create listings table
Stores all tour, stay, and volunteer listings.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false
*/
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('tour','stay','volunteer')),
  sub_category text,
  price numeric not null,
  rating numeric check (rating >= 0 and rating <= 5),
  location text,
  type text,
  availability jsonb,
  images text[],
  inclusions text[],
  exclusions text[],
  status text check (status in ('draft','published')) default 'draft',
  created_at timestamp with time zone default now()
);
comment on table public.listings is 'Tours, stays, and volunteer opportunities available on the site.';

/*
# [Operation] Create bookings table
Stores all booking information made by users.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false
*/
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  total_amount numeric not null,
  booking_date date not null,
  payment_status text check (payment_status in ('pending','paid','partial')) default 'pending',
  payment_plan text check (payment_plan in ('arrival','full','deposit','lipa_mdogo_mdogo')) default 'arrival',
  volunteer_motivation text,
  volunteer_duration text,
  created_at timestamp with time zone default now()
);
comment on table public.bookings is 'Records of user bookings for listings.';

/*
# [Operation] Create custom_package_requests table
Stores requests for custom travel packages.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false
*/
create table if not exists public.custom_package_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp_phone text,
  call_phone text,
  message text,
  status text check (status in ('new','contacted','closed')) default 'new',
  created_at timestamp with time zone default now()
);
comment on table public.custom_package_requests is 'User submissions for custom travel packages.';

/*
# [Operation] Create site_settings table
Stores global site settings, like the banner URL.
## Query Description:
The `id` is the primary key, which is crucial for the `ON CONFLICT` clause to work correctly when seeding data. This was the source of the previous error.
## **FIX APPLIED HERE**: The `id` column is now correctly defined as `primary key`.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false
*/
create table if not exists public.site_settings (
  id int primary key,
  banner_url text
);
comment on table public.site_settings is 'Global settings for the website, like the homepage banner.';

-- =============================================
-- 3. Create Profile Trigger for New Users
-- =============================================
/*
# [Operation] Create handle_new_user function and trigger
Automatically creates a new user profile upon sign-up.
## Query Description:
This function is triggered after a new user is created in `auth.users`. It inserts a corresponding row into `public.profiles`, pulling `full_name` and `role` from the user's metadata provided during sign-up.
## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true
*/
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists, to prevent errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 4. Set up Row Level Security (RLS)
-- =============================================

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.bookings enable row level security;
alter table public.custom_package_requests enable row level security;
alter table public.site_settings enable row level security;

-- Drop existing policies to prevent errors on re-run
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Admins can manage all profiles." on public.profiles;

drop policy if exists "Published listings are viewable by everyone." on public.listings;
drop policy if exists "Admins can manage all listings." on public.listings;

drop policy if exists "Users can view their own bookings." on public.bookings;
drop policy if exists "Users can create their own bookings." on public.bookings;
drop policy if exists "Admins can manage all bookings." on public.bookings;

drop policy if exists "Admins can manage all custom package requests." on public.custom_package_requests;
drop policy if exists "Anyone can create a custom package request." on public.custom_package_requests;

drop policy if exists "Site settings are viewable by everyone." on public.site_settings;
drop policy if exists "Admins can manage site settings." on public.site_settings;

-- RLS Policies for PROFILES
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);
create policy "Admins can manage all profiles." on public.profiles for all using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- RLS Policies for LISTINGS
create policy "Published listings are viewable by everyone." on public.listings for select using (status = 'published');
create policy "Admins can manage all listings." on public.listings for all using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- RLS Policies for BOOKINGS
create policy "Users can view their own bookings." on public.bookings for select using (auth.uid() = user_id);
create policy "Users can create their own bookings." on public.bookings for insert with check (auth.uid() = user_id);
create policy "Admins can manage all bookings." on public.bookings for all using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- RLS Policies for CUSTOM PACKAGE REQUESTS
create policy "Admins can manage all custom package requests." on public.custom_package_requests for all using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Anyone can create a custom package request." on public.custom_package_requests for insert with check (true);

-- RLS Policies for SITE SETTINGS
create policy "Site settings are viewable by everyone." on public.site_settings for select using (true);
create policy "Admins can manage site settings." on public.site_settings for all using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- =============================================
-- 5. Seed Initial Data
-- =============================================
/*
# [Operation] Seed initial site settings
This inserts the default banner URL. The `ON CONFLICT (id)` clause prevents errors if this script is run multiple times.
## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/
insert into public.site_settings (id, banner_url)
values (1, 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1200')
on conflict (id) do update set
  banner_url = excluded.banner_url;
