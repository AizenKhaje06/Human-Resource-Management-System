-- Create profiles table to store extended user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  position text not null,
  department text not null,
  phone text,
  profile_photo_url text,
  role text not null check (role in ('employee', 'hr_admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

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

-- Simplified policies that avoid infinite recursion
-- Users can view their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- HR admins can view all profiles (using security definer function)
create policy "profiles_select_hr_admin"
  on public.profiles for select
  using (public.is_hr_admin(auth.uid()));

-- Users can insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile (except role)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- HR admins can update any profile (using security definer function)
create policy "profiles_update_hr_admin"
  on public.profiles for update
  using (public.is_hr_admin(auth.uid()));

-- Users can delete their own profile
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create index for faster queries
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_department_idx on public.profiles(department);
