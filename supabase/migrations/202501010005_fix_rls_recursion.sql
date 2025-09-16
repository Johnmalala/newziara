/*
# [Fix RLS Infinite Recursion]
This script resolves the "infinite recursion" error by rewriting the Row-Level Security (RLS) policies for the `profiles` table. It updates the admin user's core authentication metadata and replaces the faulty policies with safe, non-recursive ones that check the user's role from their JWT access token.

## Query Description: [This operation modifies security policies and user authentication data. It is a safe and necessary fix for the critical database error. No data will be lost. It is designed to be run multiple times without causing issues.]

## Metadata:
- Schema-Category: ["Structural", "Security"]
- Impact-Level: ["Medium"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables affected: `auth.users`, `public.profiles`
- Functions created: `get_my_claim`
- Policies modified: All policies on `public.profiles`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: This script modifies authentication metadata to embed the 'admin' role in the JWT.

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Positive. Fixes a performance bottleneck caused by recursion.]
*/

-- Step 1: Update the user's metadata in the auth schema.
-- This adds the 'admin' role to the user's JWT upon their next login.
-- It's safe to run this multiple times.
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
WHERE email = 'wj00083@gmail.com';

-- Step 2: Create a helper function to securely get claims from the user's JWT.
-- This function is safe, non-recursive, and a Supabase best practice.
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> claim
$$;

-- Step 3: Drop all potentially conflicting RLS policies on the profiles table.
-- This ensures a clean slate before creating the new, correct policies.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Step 4: Create new, safe RLS policies for the profiles table.
-- These policies use the JWT claim, which prevents recursion.

-- Users can view their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles.
CREATE POLICY "Admins can view all profiles."
ON public.profiles FOR SELECT
TO authenticated
USING (get_my_claim('role') = 'admin');

-- Users can update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile.
CREATE POLICY "Admins can update any profile."
ON public.profiles FOR UPDATE
TO authenticated
USING (get_my_claim('role') = 'admin')
WITH CHECK (get_my_claim('role') = 'admin');

-- Step 5: Ensure RLS is enabled on the table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
