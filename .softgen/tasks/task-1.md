---
title: Design System & Landing Page
status: done
priority: urgent
type: chore
tags: [design-system, landing-page, auth]
created_by: agent
created_at: 2026-07-10T19:24:00Z
position: 1
---

## Notes
Establish the visual identity for the Digital Vehicle Service Card: deep slate, signal amber, porcelain background, Sora headings, IBM Plex Sans body, IBM Plex Mono for data. Use glassmorphism cards, dot-grid texture, and animated status orbs. Apply tokens to globals.css and tailwind.config.ts.

## Checklist
- [x] Apply design tokens to `globals.css` (deep slate primary, amber accent, success/warning/danger)
- [x] Register fonts and custom animations in `tailwind.config.ts`
- [x] Build premium landing page at `src/pages/index.tsx`
- [x] Build branded glassmorphism login page at `src/pages/login.tsx`
- [x] Add Toaster to `_app.tsx`
- [x] Ensure responsive layout and accessibility basics
- [x] Pass `check_for_errors`

## Acceptance
- Landing page renders the hero, stats, features, and CTA
- Login page matches the brand and supports sign-in/up/forgot flows
- Both pages pass type checks