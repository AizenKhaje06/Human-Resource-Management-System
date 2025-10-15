-- Drop existing policies that cause infinite recursion
drop policy if exists "profiles_select_hr_admin" on public.profiles;
drop policy if exists "profiles_update_hr_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- Create a security definer function to check if user is HR admin without causing recursion
create or replace function public.is_hr_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'hr_admin'
  );
$$;

-- Recreate policies without infinite recursion
-- HR admins can view all profiles (using security definer function)
create policy "profiles_select_hr_admin"
  on public.profiles for select
  using (public.is_hr_admin(auth.uid()));

-- Users can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- HR admins can update any profile (using security definer function)
create policy "profiles_update_hr_admin"
  on public.profiles for update
  using (public.is_hr_admin(auth.uid()));
