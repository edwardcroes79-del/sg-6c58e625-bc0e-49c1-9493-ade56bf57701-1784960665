<![CDATA[
---
title: Service History & Maintenance Scheduling
status: todo
priority: high
type: feature
tags: [services, scheduling, reminders, supabase]
created_by: agent
created_at: 2026-07-10T20:10:00Z
position: 5
---

## Notes
Track every service event for a vehicle, schedule future maintenance by time and mileage, and flag vehicles when either threshold is reached.

## Checklist
- [ ] Create `services`, `service_items`, and `reminders` tables with RLS
- [ ] Build service entry form on vehicle detail page
- [ ] Build maintenance scheduler with time/mileage intervals
- [ ] Implement service status calculation engine
- [ ] Add service timeline UI
- [ ] Pass `check_for_errors`

## Acceptance
- Admins can log service events with parts, labor, photos, invoices
- Vehicles are flagged when service is due or overdue
- Reminders are generated from service schedule
