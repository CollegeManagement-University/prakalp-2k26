create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('faculty', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'leave_status') then
    create type public.leave_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'faculty',
  department_id uuid references public.departments (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  code text not null unique,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.course_allocations (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  year int not null check (year >= 2000),
  assigned_at timestamptz not null default now(),
  unique (faculty_id, course_id, semester, year)
);

create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  course_allocation_id uuid not null references public.course_allocations (id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status public.leave_status not null default 'pending',
  reviewer_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id and p.role = 'admin'
  );
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.courses enable row level security;
alter table public.course_allocations enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.leave_requests enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
  on public.profiles
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can view departments" on public.departments;
create policy "Authenticated can view departments"
  on public.departments
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments"
  on public.departments
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated can view courses" on public.courses;
create policy "Authenticated can view courses"
  on public.courses
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Users can view own allocations" on public.course_allocations;
create policy "Users can view own allocations"
  on public.course_allocations
  for select
  using (faculty_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Admins can manage allocations" on public.course_allocations;
create policy "Admins can manage allocations"
  on public.course_allocations
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Users can view timetable" on public.timetable_slots;
create policy "Users can view timetable"
  on public.timetable_slots
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can manage timetable" on public.timetable_slots;
create policy "Admins can manage timetable"
  on public.timetable_slots
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Users can view own leaves" on public.leave_requests;
create policy "Users can view own leaves"
  on public.leave_requests
  for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Users can create own leaves" on public.leave_requests;
create policy "Users can create own leaves"
  on public.leave_requests
  for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update pending own leaves" on public.leave_requests;
create policy "Users can update pending own leaves"
  on public.leave_requests
  for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid());

drop policy if exists "Admins can review leaves" on public.leave_requests;
create policy "Admins can review leaves"
  on public.leave_requests
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
