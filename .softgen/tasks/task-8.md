---
title: User Settings - Business Profile & Branding
status: done
priority: medium
type: feature
tags: [settings, branding, storage, profile]
created_by: agent
created_at: 2026-07-10T19:56:00Z
position: 8
---

## Notes
Allow authenticated users to update their business profile (name, contact, address) and branding (logo, primary/accent colors). Logo uploads go to a Supabase Storage bucket.

## Checklist
- [x] Create a storage bucket `logos` with public read policy
- [x] Create `src/pages/settings.tsx` protected with `withAuth`
- [x] Build form with business name, phone, email, address inputs
- [x] Add logo uploader with preview
- [x] Add color pickers for primary and accent colors
- [x] Add password update section
- [x] Add linked login providers management
- [x] Save changes to `user_profiles`
- [x] Show toast feedback
- [x] Pass `check_for_errors`

## Acceptance
- Authenticated users can update their business details
- Logo uploads persist and display in preview
- Brand colors update in real-time preview
- Users can change their password and manage linked providers