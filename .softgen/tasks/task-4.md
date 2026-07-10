<![CDATA[
---
title: Customer Management
status: todo
priority: high
type: feature
tags: [customers, crm, supabase]
created_by: agent
created_at: 2026-07-10T20:10:00Z
position: 4
---

## Notes
Allow administrators to create and manage customer accounts. Customers can be linked to multiple vehicles and receive service reminders.

## Checklist
- [ ] Extend `customers` table with contact and address fields
- [ ] Build `/customers` list page
- [ ] Build `/customers/new` and `/customers/[id]` pages
- [ ] Link customers to vehicles
- [ ] Add customer search by name, phone, email
- [ ] Pass `check_for_errors`

## Acceptance
- Admins can create and edit customers
- Customers appear on vehicle detail pages
- Customer detail shows all owned vehicles
