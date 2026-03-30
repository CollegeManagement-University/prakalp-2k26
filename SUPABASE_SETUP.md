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
- `profiles` table
- profile creation trigger for new auth users
- RLS policies for user/admin access

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

Use `/signup` and `/login` for auth flow.
