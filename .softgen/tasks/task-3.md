<![CDATA[
---
title: Vehicle Registry
status: in_progress
priority: high
type: feature
tags: [vehicles, registry, crud, supabase]
created_by: agent
created_at: 2026-07-10T20:10:00Z
position: 3
---

## Notes
Allow administrators to register, view, edit, and manage vehicles. Each vehicle belongs to a customer and a workshop (user). Store vehicle details, images, documents, and current status.

## Checklist
- [ ] Create `vehicles`, `vehicle_images`, and `vehicle_documents` tables with RLS
- [ ] Create `customers` table linked to vehicles
- [ ] Add vehicle storage buckets for photos and documents
- [ ] Build `/vehicles` page with searchable list
- [ ] Build `/vehicles/new` page with multi-step form
- [ ] Build `/vehicles/[id]` detail page
- [ ] Implement status indicators (up to date / due soon / overdue)
- [ ] Add search/filter by plate, VIN, make, model, customer, status
- [ ] Pass `check_for_errors`

## Acceptance
- Admins can add vehicles with full details and photos
- Vehicle list is searchable and filterable
- Detail page shows service status, history, and upcoming maintenance
