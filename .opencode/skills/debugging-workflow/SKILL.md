---
name: debugging-workflow
description: Use when debugging errors, broken features, failed builds, failing tests, runtime issues, API bugs, database errors, React Native issues, FastAPI issues, or TypeScript problems.
---

# Debugging Workflow Skill

Use this skill for every debugging task.

## Step 1: Understand the Problem

Before editing, identify:

- What is broken?
- What was expected?
- What actually happened?
- Is there an error message?
- Is it frontend, backend, database, API, build, or test related?

## Step 2: Collect Evidence

Inspect:

- Error logs
- Stack trace
- Recently changed files
- Related components/routes/services
- API request/response
- Database schema if relevant
- Test output if relevant

Do not guess before checking evidence.

## Step 3: Locate Root Cause

Find:

- Exact file causing issue
- Exact function/component/endpoint involved
- Whether the issue is caused by:
  - wrong type
  - wrong import
  - missing route registration
  - API contract mismatch
  - database schema mismatch
  - invalid state handling
  - missing dependency
  - wrong environment/config
  - incorrect logic

## Step 4: Fix Minimally

Rules:

- Fix only the root cause.
- Avoid unrelated refactors.
- Avoid changing architecture during debugging.
- Avoid changing public API unless required.
- Preserve existing behavior.

## Step 5: Verify

Run the smallest relevant check:

- TypeScript check
- frontend build
- backend test
- API test
- app run command
- failing test only
- OpenAPI check if API changed

## Step 6: Report

Always end with:

1. Root cause
2. Fix applied
3. Files changed
4. How to test
5. Remaining risks
