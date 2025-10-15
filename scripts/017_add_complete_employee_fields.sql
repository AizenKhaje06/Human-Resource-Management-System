-- Add all necessary employee fields to profiles table
-- This includes work schedule, contract details, salary info, and more

-- Add new columns to profiles table
alter table public.profiles
  add column if not exists time_in time,
  add column if not exists time_out time,
  add column if not exists days_of_work text[] default array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists rate_type text check (rate_type in ('daily', 'monthly', 'hourly')),
  add column if not exists salary_rate numeric(10, 2),
  add column if not exists shift_type text check (shift_type in ('day', 'mid', 'night')),
  add column if not exists date_hired date,
  add column if not exists remarks text;

-- Update employment_status to include contractual
alter table public.profiles
  drop constraint if exists profiles_employment_status_check;

alter table public.profiles
  add constraint profiles_employment_status_check 
  check (employment_status in ('regular', 'probationary', 'part-time', 'contractual'));

-- Set default values for existing records
update public.profiles
set 
  time_in = '09:00:00'::time,
  time_out = '18:00:00'::time,
  rate_type = 'monthly',
  shift_type = 'day',
  date_hired = created_at::date
where time_in is null;

-- Create indexes for better query performance
create index if not exists profiles_employment_status_idx on public.profiles(employment_status);
create index if not exists profiles_rate_type_idx on public.profiles(rate_type);
create index if not exists profiles_date_hired_idx on public.profiles(date_hired);

-- Add comment for documentation
comment on column public.profiles.days_of_work is 'Array of working days (e.g., Monday, Tuesday, etc.)';
comment on column public.profiles.rate_type is 'Salary calculation type: daily, monthly, or hourly';
comment on column public.profiles.shift_type is 'Work shift: day (6am-2pm), mid (2pm-10pm), or night (10pm-6am)';
