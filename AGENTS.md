# Project AI Rules

This project is a personal task management application.

Stack:

- React Native + TypeScript for mobile frontend
- FastAPI for backend
- SQLite for database

## Always Follow

- Build one feature at a time.
- Do not rewrite unrelated files.
- Prefer simple, maintainable code over clever abstractions.
- Explain changed files after edits.
- Keep frontend and backend API contracts synchronized.

## Frontend Rule

Whenever the task touches React Native, mobile UI, navigation, screens, components, hooks, forms, styling, API integration, state management, animations, or frontend architecture, act as a senior React Native and mobile development expert.

Before writing frontend code, follow the instructions in:

docs/frontend-rules.md

Treat those frontend rules as mandatory for all frontend work.

## Product and Business Questions

When the user asks about business ideas, product-market fit, monetization, roadmap, competitor analysis, market positioning, MVP scope, or product strategy, prefer using:

- @product-strategist
- product-market-fit skill

Do not treat product strategy questions as coding tasks unless the user explicitly asks for implementation.

## Response Style

Always end responses with:

### Short Summary

- What was decided or done
- Key files/modules involved
- Next recommended step
- Any risk, assumption, or thing to verify

Keep the summary concise, beginner-friendly, and useful.

## Debugging Rule

When the user asks to debug, fix an issue, investigate an error, resolve a bug, analyze a failed build, fix failing tests, or trace a runtime problem, prefer using:

- @debugger
- debugging-workflow skill

Debugging must follow this order:

1. Understand the problem.
2. Read the exact error/log/stack trace.
3. Inspect related files.
4. Find the root cause.
5. Apply the smallest safe fix.
6. Run relevant verification.
7. Report root cause, files changed, fix, test command, and remaining risks.

Do not randomly rewrite code.
Do not perform large refactors while debugging unless explicitly requested.

## Fullstack Coding Rule

When the user asks to build, implement, code, add, or update a fullstack feature, prefer using:

- @fullstack-builder
- fullstack-feature-builder skill

## UI/UX Design Rule

When the user asks about UI, UX, design, layout, screen polish, professional look, consistency, app design, mobile experience, components, spacing, typography, colors, or visual improvements, prefer using:

- @ui-ux-designer
- ui-ux-screen-design skill

## Repo Audit Rule

When the user asks to scan, audit, inspect, review, or find bugs in the repository, prefer using:

- @repo-auditor

## Context7 MCP Usage Policy

Use Context7 automatically when the task involves:

- Installing, upgrading, or configuring a library/framework
- Writing code that depends on external APIs, SDKs, framework conventions, or package-specific behavior
- Fixing errors related to library usage, deprecated APIs, breaking changes, or version mismatch
- Implementing features using React, Next.js, Angular, Prisma, Supabase, TanStack Query, Tailwind, Zod, tRPC, NestJS, Express, Expo, React Native, or any third-party package
- Refactoring code to match the latest recommended documentation or migration guides

Do NOT use Context7 when:

- The task is pure business logic inside this repo
- The answer can be derived from existing project files
- The task is UI copy, naming, folder organization, simple TypeScript cleanup, or local debugging
- The library API is not involved

Before using Context7:

1. Inspect package.json, lockfile, framework config, and relevant source files.
2. Detect the exact library and installed version.
3. Query Context7 using the exact library name/version when possible.
4. Use only the docs relevant to the current change.
5. Do not load broad docs unnecessarily.

When updating code:

- Prefer the existing project architecture and patterns.
- Do not rewrite working code just because docs show a different style.
- Make small, reviewable changes.
- After changes, run the smallest relevant typecheck/lint/test command.
- Mention which external docs were used and why.

## Context7 / Latest Docs Rule

When a task involves third-party libraries, frameworks, SDKs, package APIs, setup, configuration, migrations, upgrades, breaking changes, or deprecated API errors:

1. Load the `context7-policy` skill if available.
2. Inspect the repo first to identify the exact package and version.
3. Use Context7 only for the specific library/topic needed.
4. Do not use Context7 for pure internal business logic, simple refactors, naming, or UI copy.

## Design-to-Code Rule

Whenever a UI image, mockup, or screenshot is provided, treat it as the visual source of truth.

Before coding:

1. Analyze the image visually.
2. Break it into layout sections.
3. Map each section to components.
4. Extract colors, spacing, typography, radius, shadows, icons, and states.
5. Inspect existing project design tokens and components.
6. Implement the screen to match the image closely.
7. Compare the implementation against the image and refine.

Never redesign unless explicitly asked.
Never ignore the provided image.
Never replace the visual style with generic UI.
