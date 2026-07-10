---
title: Vehicle Registry
status: done
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
- [x] Create `vehicles`, `vehicle_images`, and `vehicle_documents` tables with RLS
- [x] Create `customers` table linked to vehicles
- [x] Add vehicle storage buckets for photos and documents
- [x] Build `/vehicles` page with searchable list
- [x] Build `/vehicles/new` page with multi-step form
- [x] Build `/vehicles/[id]` detail page
- [x] Implement status indicators (up to date / due soon / overdue)
- [x] Add search/filter by plate, VIN, make, model, customer, status
- [x] Pass `check_for_errors`

## Acceptance
- Admins can add vehicles with full details and photos
- Vehicle list is searchable and filterable
- Detail page shows service status, history, and upcoming maintenance
