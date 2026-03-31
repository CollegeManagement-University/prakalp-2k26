# Supabase Setup

## 1. Configure environment variables

1. Copy `.env.example` to `.env.local`.
2. Set values from your Supabase project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Run database schema

1. Open Supabase SQL Editor.
2. Execute the SQL in `supabase/schema.sql`.

This creates:
- enums for roles and leave status
- `departments`, `profiles`, `courses`, `course_allocations`, `timetable_slots`, `leave_requests`
- profile creation trigger for new auth users
- RLS policies for faculty/admin access control
- demo seed data for departments, courses, and auth users

## 3. Enable authentication provider

In Supabase Dashboard:
1. Go to Authentication > Providers.
2. Enable Email provider.
3. Optional: disable email confirmation for local testing.

## 4. Configure redirect URLs

In Authentication > URL Configuration:
1. Site URL: `http://localhost:3000`
2. Additional redirect URL: `http://localhost:3000/auth/callback`

## 5. Start app

Run:

```bash
pnpm dev
```

Use `/login` for faculty/admin access. The dedicated student registration path is `/student-register`.
The `/signup` route is kept as a compatibility alias and redirects to `/student-register`.

Students register with name, email, and password at `/student-register`. After signing in at `/login`, role-based routing sends students to `/student-dashboard`, faculty to `/timetable`, and admins to `/`.

After login, the dashboard home page shows "Supabase Connection" status and reads from `profiles`, `departments`, and `courses` to verify schema linkage.

## If student signup returns 500

1. Re-run `supabase/schema.sql` in Supabase SQL Editor to refresh `public.handle_new_user` trigger function.
2. Ensure the re-run completes without errors so `supabase_auth_admin` grants/policies on `public.profiles` are applied.
3. In Supabase Authentication > URL Configuration, ensure callback URL is allowed:
   - `http://localhost:3000/auth/callback`
4. Retry signup from the student dashboard flow.

## Demo users (created by schema.sql)

- `admin.demo@college.local` / `Admin@12345` (admin)
- `faculty1.demo@college.local` / `Faculty@12345` (faculty)
- `faculty2.demo@college.local` / `Faculty@12345` (faculty)

If your Supabase project blocks direct inserts into `auth.users`, create these users from Authentication > Users, then rerun `supabase/schema.sql` to upsert roles/profile data.
