/*
  # [Fix RLS Infinite Recursion on Profiles]
  This migration corrects a critical issue where the Row-Level Security (RLS) policy on the `profiles` table was causing an infinite recursion error. The previous policy checked for an admin role by querying the `profiles` table itself, leading to a loop.

  ## Query Description:
  This script replaces the faulty policies with new ones that are safe and efficient. It also updates the core authentication data for the admin user to ensure their role is included in their access token (JWT). This is a safe, non-destructive operation.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true (by restoring the old policies)

  ## Structure Details:
  - Modifies RLS policies on the `public.profiles` table.
  - Updates metadata for one user in the `auth.users` table.

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes. Replaces existing SELECT policies with more secure, non-recursive versions.
  - Auth Requirements: Affects authenticated users.
*/

-- Step 1: Update the admin user's metadata in the core auth schema.
-- This is CRITICAL for the new policy to work. It injects the 'role' into the user's JWT on their next login.
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
WHERE email = 'wj00083@gmail.com';


-- Step 2: Drop all existing SELECT policies on the profiles table to ensure a clean slate.
-- Using 'IF EXISTS' prevents errors if the policies don't exist or have different names.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;


-- Step 3: Create a new, safe policy for users to see their own profile.
-- This policy compares the current user's ID with the row's ID, which is non-recursive.
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);


-- Step 4: Create a new, safe policy for admins to see all profiles.
-- This policy reads the 'role' directly from the user's JWT access token, avoiding any database queries.
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');
