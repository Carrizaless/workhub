-- 016_fix_users_rls_for_collaborators.sql
-- Allow all authenticated users to see basic info of other users.
-- This is needed for: chat (see sender names), task detail (see assignee),
-- collaborator list, notification sender names, etc.

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- All authenticated users can read all user profiles
-- (needed for chat sender info, task assignee names, etc.)
CREATE POLICY "Authenticated users can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);
