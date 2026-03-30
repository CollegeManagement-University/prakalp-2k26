# College Management Dashboard

AI-assisted college management system built with Next.js and Supabase.

## Features

- Role-based dashboard for admin and faculty.
- Semester-wise syllabus upload and tracking.
- Timetable generation gated by uploaded syllabus.
- Faculty timetable view from admin allocations.
- Faculty workflows: apply leave, add qualifications, view notifications.
- Supabase authentication and database integration.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run SQL schema in Supabase SQL Editor:

- Use [supabase/schema.sql](supabase/schema.sql).

4. Start development server:

```bash
pnpm dev
```

## Workflow: Syllabus -> Timetable

1. Open [app/syllabus/page.tsx](app/syllabus/page.tsx).
2. Select semester, section, and department.
3. Upload syllabus PDF.
4. Open [app/timetable/page.tsx](app/timetable/page.tsx).
5. Use the same semester, section, and department.
6. Click Generate Timetable.

If syllabus is missing for that combination, timetable generation is blocked and a toast error is shown.

## Faculty Timetable Rule

- Faculty users do not generate timetables.
- Faculty timetable is loaded from admin allocations using:
  - `course_allocations`
  - `timetable_slots`

## Build

```bash
pnpm build
```

## Notes

- This project currently stores syllabus upload metadata in local storage for generation gating.
- You can extend this by storing syllabus files and metadata in Supabase Storage + database tables.
