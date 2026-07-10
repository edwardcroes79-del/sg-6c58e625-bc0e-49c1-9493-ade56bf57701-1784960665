---
title: Database Schema, Auth & Storage
status: todo
priority: urgent
type: feature
tags: [supabase, schema, auth, storage]
created_by: agent
created_at: 2026-07-10T19:23:56Z
position: 2
---

## Notes
Create the Supabase tables, RLS policies, and storage buckets needed for the platform. Wire up authentication and role-based access.

## Checklist
- [ ] Create workshops, profiles, vehicles, services, reminders tables
- [ ] Set up RLS policies for admin/owner access
- [ ] Create storage buckets for vehicle photos, service photos, documents
- [ ] Configure auth triggers for profile creation
- [ ] Build login page
- [ ] Build admin registration flow
- [ ] Set up role-based route guards

## Acceptance
- Admin can register and log in
- Vehicle records are protected by RLS
- Files can be uploaded to storage