BEGIN;

-- Step 1: Update the user's metadata in the auth schema.
-- This ensures the 'admin' role is embedded in the JWT upon next login.
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'wj00083@gmail.com';

-- Step 2: Drop all existing RLS policies on the 'profiles' table to start clean.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles." ON public.profiles;
DROP POLICY IF EXISTS "Allow view access based on role" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin update access" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin delete access" ON public.profiles;


-- Step 3: Drop the recursive helper function as it's no longer needed.
DROP FUNCTION IF EXISTS public.is_admin(uuid);


-- Step 4: Create new, safe RLS policies using JWT claims.

-- POLICY: Users can view profiles.
-- Allows a user to select their own profile OR allows an admin to select any profile.
CREATE POLICY "Allow view access based on role" ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin'
);

-- POLICY: Users can update their own profile.
CREATE POLICY "Allow individual update access" ON public.profiles
FOR UPDATE
USING ( auth.uid() = id );

-- POLICY: Admins can update any profile.
CREATE POLICY "Allow admin update access" ON public.profiles
FOR UPDATE
USING ( (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin' );

-- POLICY: Admins can delete any profile.
CREATE POLICY "Allow admin delete access" ON public.profiles
FOR DELETE
USING ( (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin' );

COMMIT;
