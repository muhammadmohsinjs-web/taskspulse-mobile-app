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
