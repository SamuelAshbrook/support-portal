# Step3 Support Portal — Project Reference

**Last updated:** July 2026  
**Overall MVP progress:** ~65–70%

---

## 1. Project summary

**Aim:** Enterprise web-based client support portal for Step3 — centralised tickets, structured communication, company-scoped timesheets, role-based access.

**Approach:** Iterative / Agile-inspired sprints  
**Developer:** Solo (academic project, real business context)

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, lucide-react icons |
| Language | TypeScript 5 |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 + `@prisma/adapter-neon` |
| Auth | Better Auth (email/password, Admin plugin) |
| File storage | Vercel Blob (`@vercel/blob`) |
| CI | GitHub Actions (lint + typecheck + build) |
| Deployment (planned) | Vercel + Neon |

**Key env vars:** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

---

## 3. Sprint plan & status overview

The project follows an 8-sprint plan. Sprints are flexible and can be tweaked as needed.

| Sprint | Focus | Status | Progress |
|--------|-------|--------|----------|
| 1 | Gather requirements & design system | ✅ Complete | 100% |
| 2 | Initial setup (environment, DB, auth) | ✅ Complete | 100% |
| 3 | Admin functionality | ✅ Complete (core) | ~90% |
| 4 | Ticket management | 🔄 In progress | ~85% |
| 5 | Ticket messaging & email notifications | ⬜ Not started | ~10% (read-only UI) |
| 6 | Timesheet functionality | ⬜ Not started | ~15% (schema only) |
| 7 | Refine UI and UX | 🔄 Partial | ~30% |
| 8 | Final testing, docs, and deploy | ⬜ Not started | ~15% (CI only) |

**Current sprint:** Sprint 5 (messaging & email), with Sprint 4 attachment wiring as carryover.

---

## 4. Completed ✅

### Sprint 1 — Requirements & design system

- [x] Requirements & scope defined (tickets, timesheets, RBAC, multi-company)
- [x] Tech stack chosen
- [x] Brand direction started (colours, Step3 logo, Figtree font)

### Sprint 2 — Setup, database, auth

- [x] Next.js project with TypeScript and Tailwind
- [x] Neon Postgres connected via Prisma 7 + Neon adapter
- [x] Prisma singleton (`app/lib/prisma.ts`)
- [x] Full schema: Company, User, Ticket, TicketMessage, TicketAttachment, Timesheet + Better Auth tables
- [x] 6 migrations applied (init, timesheet, better auth, admin plugin, ticket number, ticket type/priority/attachments)
- [x] `next.config.ts` — turbopack root pinned
- [x] `proxy.ts` — route protection (redirect unauthenticated to `/login`)
- [x] Better Auth configured (`app/lib/auth.ts`)
- [x] Email/password login; public signup disabled
- [x] Admin plugin: `ADMIN` / `CLIENT` roles
- [x] `companyId` on user (multi-company scoping)
- [x] Auth API route: `app/api/auth/[...all]/route.ts`
- [x] Auth client: `app/lib/auth-client.ts`
- [x] Permissions: `app/lib/permissions.ts`
- [x] Login page: `app/login/page.tsx` (styled)
- [x] Sign-out button component
- [x] Shared session helpers: `app/lib/session.ts` (`getSession`, `requireUser`, `requireAdmin`, `assertAdmin`)
- [x] Authenticated layout: `app/(app)/layout.tsx` (header, nav, session check, sign out)
- [x] Admin layout guard: `app/(app)/admin/layout.tsx`
- [x] CI pipeline (`.github/workflows/ci.yml`): lint + typecheck + build

### Sprint 3 — Admin functionality

- [x] Create company + list companies (`/admin/companies`)
- [x] Create client user + list users (`/admin/users`)
- [x] Client users linked to company via `auth.api.createUser`
- [x] Admin actions use shared `assertAdmin()`

### Sprint 4 — Ticket management (core)

- [x] Ticket list page: `/tickets` (role-scoped: admin = all, client = own company)
- [x] Ticket list styled with status/priority badges, excerpts, metadata (lucide icons)
- [x] Ticket detail page: `/tickets/[id]` (authorization check, 404 if wrong company)
- [x] Create-ticket form (client-only) with title, description, type, priority + validation
- [x] `createTicket` server action (`app/(app)/tickets/actions.ts`)
- [x] `updateTicketStatus` server action + admin status dropdown on detail page
- [x] Ticket number (autoincrement), `TicketType` and `TicketPriority` enums
- [x] "Tickets" link in main nav
- [x] Message thread display on detail page (read-only)

---

## 5. In progress 🔄

### Sprint 4 — Ticket management (finish these)

| Task | Status | Notes |
|------|--------|-------|
| Wire up file attachments end-to-end | ⬜ Todo | Schema + upload route + form input exist but are **not connected**: form uses a plain file input, `createTicket` never persists attachments, upload route never called from client |
| Render attachments on ticket detail | ⬜ Todo | No display of `TicketAttachment` yet |
| Manual acceptance test (ticket scoping) | ⬜ Todo | Client vs admin vs cross-company URL |
| Verify status-update RBAC | ⬜ Todo | Confirm `updateTicketStatus` admin-only path |

### Sprint 7 — UI/UX (early items already touched)

| Task | Status | Notes |
|------|--------|-------|
| Replace home placeholder | ⬜ Todo | `app/(app)/page.tsx` still shows `Companies in DB: X` |
| Redesign ticket detail page | ⬜ Todo | Currently bare (raw status text, minimal layout) |

---

## 6. Not started ⬜

### Sprint 5 — Messaging & email notifications

- [ ] `addMessage` server action (company/role scoping)
- [ ] Reply form on `/tickets/[id]`
- [ ] Bump ticket `updatedAt` when a message is added
- [ ] Style the message thread (sender, timestamp, alignment)
- [ ] Empty/error states for message thread
- [ ] Choose + configure email provider (env vars, secrets) — *stretch / independently droppable*
- [ ] Email notification on new ticket (to admins)
- [ ] Email notification on new message (to the other party)
- [ ] Email templates (new ticket / new reply)

### Sprint 6 — Timesheets

- [ ] `createTimesheet` server action (admin, company-scoped)
- [ ] Admin: create/upload timesheet entries (`/admin/timesheets` or similar)
- [ ] Client: read-only timesheet list (scoped by `companyId`)
- [ ] Timesheet totals / summary display

### Sprint 7 — Refine UI & UX

- [ ] Dashboard / meaningful home page
- [ ] Consolidate design tokens (colours, spacing, typography) into a reusable system
- [ ] Reusable UI components (buttons, badges, form fields, cards)
- [ ] Consistent empty states + loading/pending states across pages
- [ ] Ticket filter/search (status, priority, company) — optional
- [ ] Responsive/mobile nav pass
- [ ] Accessibility pass (labels, focus states, contrast)
- [ ] Admin: user ban/unban (Better Auth admin plugin — fields exist in schema)
- [ ] Admin: rename company

### Sprint 8 — Testing, deployment, docs

- [ ] Enable CI test step; add Vitest
- [ ] Unit/integration tests (RBAC, ticket scoping)
- [ ] Playwright E2E (optional, late sprint)
- [ ] Rewrite README (setup, env vars, architecture, run/deploy) — currently boilerplate
- [ ] Production deploy (Vercel + Neon prod DB)
- [ ] Env vars in Vercel
- [ ] Prod migrations
- [ ] One-time prod admin bootstrap
- [ ] Post-deploy smoke tests
- [ ] Final evaluation & documentation

### Deferred (post-MVP)

- [ ] Ticket assignment (`assignedToId`)
- [ ] Attachment support for non-image file types
- [ ] Password reset flow
- [ ] Edit/hard delete of companies and users (blocked by FK RESTRICT — use ban/rename)

---

## 7. Routes map

| Route | Access | Status |
|-------|--------|--------|
| `/login` | Public | ✅ Done |
| `/` | Authenticated | ⚠️ Placeholder |
| `/tickets` | Authenticated | ✅ List + create form |
| `/tickets/[id]` | Authenticated + scoped | ✅ Detail + status update (read-only messages) |
| `/admin/companies` | Admin | ✅ Done |
| `/admin/users` | Admin | ✅ Done |
| `/api/tickets/upload` | Client | ⚠️ Route exists, not wired to UI |
| `/api/auth/*` | Public (auth endpoints) | ✅ Done |

**Missing routes:** timesheets (admin + client), dashboard

---

## 8. Database (summary)

**Domain entities:** Company, User, Ticket, TicketAttachment, TicketMessage, Timesheet  
**Auth entities:** user, session, account, verification (Better Auth)  
**Enums:** Role (ADMIN, CLIENT), TicketStatus (OPEN, IN_PROGRESS, RESOLVED, ARCHIVED), TicketType (FIX_PROBLEM, ASK_QUESTION, UPDATE_OR_ADD, BILLING), TicketPriority (LOW, MEDIUM, HIGH, URGENT)

Schema is **MVP-complete** — no new tables needed for remaining features.

---

## 9. Key files

```
app/
├── (app)/
│   ├── layout.tsx              # App shell, nav (logo, Tickets, admin links)
│   ├── page.tsx                # Home (placeholder)
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── companies/          # create + list (page.tsx, actions.ts)
│   │   └── users/              # create + list (page.tsx, actions.ts)
│   └── tickets/
│       ├── page.tsx            # list + create form
│       ├── create-ticket-form.tsx
│       ├── actions.ts          # createTicket, updateTicketStatus
│       └── [id]/page.tsx       # detail + status update + read messages
├── api/
│   ├── auth/[...all]/route.ts
│   └── tickets/upload/route.ts # Vercel Blob upload (not yet wired to UI)
├── login/page.tsx
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── prisma.ts
│   ├── session.ts
│   ├── permissions.ts
│   ├── ticket-status.ts        # status label/style helpers
│   ├── ticket-type.ts
│   ├── ticket-priority.ts
│   ├── format-date.ts
│   └── format-excerpt.ts
└── components/sign-out-button.tsx
proxy.ts                        # Route protection
prisma/schema.prisma
.github/workflows/ci.yml        # lint + typecheck + build
```

---

## 10. Testing status

| Type | Status |
|------|--------|
| ESLint | ✅ Configured + running in CI |
| TypeScript | ✅ `typecheck` script + running in CI |
| Build check | ✅ Running in CI |
| Manual sprint checklists | 🔄 Ad hoc |
| Vitest / unit tests | ⬜ Not set up (CI test step commented out) |
| Integration tests | ⬜ Not set up |
| E2E (Playwright) | ⬜ Not set up |

**Plan:** Finish Sprint 4 (attachments) → Sprint 5 (messaging) → add Vitest for RBAC/tickets → E2E before deploy.

---

## 11. Deployment status

| Item | Status |
|------|--------|
| CI pipeline | ✅ lint + typecheck + build |
| Vercel connected | ⬜ Not done |
| Production Neon DB | ⬜ Not done |
| Env vars in Vercel | ⬜ Not done |
| Prod migrations | ⬜ Not done |
| Prod admin bootstrap | ⬜ Not done |

**Process:** Push to `main` → CI → Vercel auto-deploy → migrate when schema changes → smoke test.

---

## 12. Immediate next actions (priority order)

1. Wire up file attachments end-to-end (call upload route from create form → persist `TicketAttachment` in `createTicket` → render on detail page)
2. Run manual Sprint 4 acceptance checklist (ticket scoping + status-update RBAC)
3. Start Sprint 5: `addMessage` action + reply form on `/tickets/[id]`
4. Style the message thread + bump `updatedAt` on new message
5. Configure email provider + new-ticket / new-message notifications
6. Replace `app/(app)/page.tsx` placeholder with a dashboard or redirect to `/tickets`

---

## 13. Brief requirement traceability

| Requirement | Status |
|-------------|--------|
| Secure login | ✅ |
| Admin-provisioned accounts | ✅ |
| Manage companies | ✅ Create/list |
| Manage client contacts | ✅ Via users |
| Create support tickets | ✅ Form + action |
| View tickets | ✅ |
| Track ticket status | ✅ Display + admin update |
| Ticket type & priority | ✅ |
| File attachments | 🔄 Schema + route + input, not wired |
| Messages in tickets | 🔄 View only; reply pending |
| Email notifications | ⬜ |
| Company-scoped timesheets | ⬜ Schema only |
| RBAC | ✅ |
| Dashboard | ⬜ |

---

## 14. Known issues / reminders

- After schema changes: `npx prisma generate`, clear `.next`, restart dev server
- `BETTER_AUTH_URL` must match exact production URL when deploying
- Hard delete of users/companies with tickets fails (FK RESTRICT) — use ban, not delete
- File attachments are half-built: schema, upload route, and form input exist but are not connected
- `updateTicketStatus` uses `assertAdmin()` while `createTicket` uses `getSession()` — minor consistency cleanup available
- README is still `create-next-app` boilerplate — needs a real rewrite for Sprint 8

---

## 15. How to keep this file updated

At the end of each sprint:

1. Move completed items from "In progress" / "Not started" to "Completed"
2. Update sprint progress percentages and the current sprint marker
3. Refresh "Immediate next actions"
4. Update "Last updated" date at the top
