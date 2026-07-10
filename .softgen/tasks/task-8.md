---
title: User Settings - Business Profile & Branding
status: in_progress
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
- [ ] Create a storage bucket `logos` with public read policy
- [ ] Create `src/pages/settings.tsx` protected with `withAuth`
- [ ] Build form with business name, phone, email, address inputs
- [ ] Add logo uploader with preview
- [ ] Add color pickers for primary and accent colors
- [ ] Save changes to `user_profiles`
- [ ] Show toast feedback
- [ ] Pass `check_for_errors`

## Acceptance
- Authenticated users can update their business details
- Logo uploads persist and display in preview
- Brand colors update in real-time preview