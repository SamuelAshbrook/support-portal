<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Rules

## Project

Enterprise client support portal built with Next.js, TypeScript, Prisma, Neon, and BetterAuth.

The app manages companies, client users, support tickets, ticket messages, timesheets, dashboards, authentication, permissions, and multi-tenant company data.

## Core rules

- Read `PROJECT_REFERENCE.md` before changing domain logic, architecture, database models, auth, permissions, or workflows.
- Do not bypass BetterAuth, RBAC, validation, TypeScript, linting, or build errors.
- Treat this as a multi-tenant system: clients must only access their own company data.
- Do not expose one company's data to another company.
- Do not log passwords, tokens, sessions, PII, ticket messages, or timesheet data.
- After changing `prisma/schema.prisma`: run `npx prisma generate`, clear `.next`, and restart the dev server.
- Prefer existing project patterns over new ones.
- Do not add new libraries without explaining why.

## Workflow

For non-trivial changes:

1. Inspect relevant files.
2. Make a short plan.
3. Implement the smallest safe change.
4. Run relevant checks.
5. Summarize changed files, checks run, and risks.

## Checks

Check `package.json` for available scripts.

Run when relevant:

```bash
npm run lint
npm run typecheck
npm run build
```