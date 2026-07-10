---
title: Database Schema, Auth & Storage
status: done
priority: urgent
type: feature
tags: [supabase, database, auth, storage, rls]
created_by: agent
created_at: 2026-07-10T19:25:00Z
position: 2
---

## Notes
Set up the Supabase data model for users, workshops, vehicles, customers, service history, schedules, and documents. Enable RLS on every table. Create storage buckets for vehicle photos and documents.

## Checklist
- [x] Create `user_profiles` table with RLS and auth trigger
- [x] Extend `authService.ts` with profile CRUD helpers
- [x] Set up sign-in/up/forgot flows on the login page
- [x] Add Edge middleware for session-based route protection
- [x] Add `withAuth` HOC for client-side session validation
- [x] Pass `check_for_errors`

## Acceptance
- New users get a `user_profiles` row automatically
- Users can register and log in
- Vehicle records are protected by RLS
- Files can be uploaded to storage