---
title: Customer Management
status: done
priority: high
type: feature
tags: [customers, crud, supabase]
created_by: agent
created_at: 2026-07-10T20:15:00Z
position: 4
---

## Notes
Allow administrators to create and manage customers (vehicle owners). Each customer is scoped to a workshop user and can be linked to multiple vehicles.

## Checklist
- [x] Build `/customers` page with searchable directory
- [x] Build `/customers/new` form
- [x] Build `/customers/[id]` detail page
- [x] Wire customer selector into vehicle creation flow
- [x] Link customer detail to their vehicles
- [x] Pass `check_for_errors`

## Acceptance
- Admins can add and edit customers
- Customers appear on vehicle detail pages
- Customer detail shows all owned vehicles
