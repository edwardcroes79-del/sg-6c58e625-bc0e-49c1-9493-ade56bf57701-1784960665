---
title: Auth Middleware & Route Protection
status: in_progress
priority: high
type: feature
tags: [auth, middleware, routing, supabase]
created_by: agent
created_at: 2026-07-10T19:35:00Z
position: 7
---

## Notes
Protect dashboard and admin routes by checking Supabase session. Use Edge middleware for fast cookie-based redirects plus a `withAuth` HOC for client-side session validation and loading states.

## Checklist
- [ ] Create `src/middleware.ts` to redirect unauthenticated users from `/dashboard` and `/admin`
- [ ] Create `src/lib/withAuth.tsx` HOC for client-side session validation
- [ ] Create basic `src/pages/dashboard.tsx` protected with `withAuth`
- [ ] Add logout capability and user role display
- [ ] Run `check_for_errors` and validate redirects

## Acceptance
- Unauthenticated users hitting `/dashboard` are redirected to `/login`
- Authenticated users see the dashboard
- The middleware compiles and passes type checks