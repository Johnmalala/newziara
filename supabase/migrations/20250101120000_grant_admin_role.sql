/*
# [Operation Name] Grant Admin Privileges

[This script elevates a specific user to 'admin' status by updating their role in the profiles table. This will grant them full access to the admin portal and all its features.]

## Query Description: [This operation modifies a single user's access level to grant them administrative rights. Ensure this is the correct user before running, as admins have control over site content and user data. This change is reversible by setting the role back to 'user'.]

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.profiles
- Column: role

## Security Implications:
- RLS Status: Enabled
- Policy Changes: No (The user will now match existing 'admin' role checks in RLS policies)
- Auth Requirements: This user will be able to perform all admin actions.

## Performance Impact:
- Indexes: Not affected
- Triggers: Not affected
- Estimated Impact: Negligible
*/

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'wj00083@gmail.com'
);
