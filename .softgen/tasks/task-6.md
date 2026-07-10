<![CDATA[
---
title: Digital Service Card & QR Code
status: todo
priority: high
type: feature
tags: [service-card, qr-code, public, sharing]
created_by: agent
created_at: 2026-07-10T20:10:00Z
position: 6
---

## Notes
Generate a beautiful public digital service card per vehicle, accessible via a unique QR code. Owners and workshops can share the link; scanning shows current status and history.

## Checklist
- [ ] Create public `/service-card/[id]` page
- [ ] Generate unique QR code URL per vehicle
- [ ] Build vehicle header with banner image and details
- [ ] Show owner information, service history, and upcoming maintenance
- [ ] Add QR code download/print action for admins
- [ ] Pass `check_for_errors`

## Acceptance
- Each vehicle has a unique QR code
- Scanning displays the live digital service card
- Service card is mobile-responsive and branded
