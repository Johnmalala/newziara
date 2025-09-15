/*
# [SECURITY FIX] Set Function Search Path
This script alters the `handle_new_user` function to explicitly set the `search_path`. This is a security best practice to prevent potential function hijacking by malicious actors who might gain the ability to create objects in the `public` schema.

## Query Description:
- This operation modifies an existing function's definition.
- It is a safe, non-destructive change that improves security.
- No data will be affected.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to the old function definition)

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges required to alter functions.
- Mitigates: "Function Search Path Mutable" security warning.
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$;
