---
title: Service History & Maintenance Scheduling
status: in_progress
priority: high
type: feature
tags: [services, scheduling, reminders, supabase]
created_by: agent
created_at: 2026-07-10T20:20:00Z
position: 5
---

## Notes
Allow administrators to log service records with parts, labor, costs, and technician notes. Automatically schedule the next service based on time/mileage and generate reminders.

## Checklist
- [ ] Create `services`, `service_items`, and `reminders` tables with RLS
- [ ] Build service record creation flow from vehicle detail
- [ ] Build service history timeline UI
- [ ] Implement automatic next-service calculation from interval
- [ ] Generate reminders based on due date and mileage
- [ ] Create `/services` and `/reminders` list pages
- [ ] Pass `check_for_errors`

## Acceptance
- Admins can log full service records with parts and costs
- Vehicles are flagged when service is due or overdue
- Reminders are generated from service schedule
