---
name: fullstack-feature-builder
description: Use when building an end-to-end feature across React Native frontend, FastAPI backend, SQLite database, API contracts, screens, forms, and tests.
---

# Fullstack Feature Builder Skill

Use this skill for fullstack implementation.

This skill is for building one complete vertical slice at a time.

## Step 1: Understand the Feature

Before coding, identify:

- Feature name
- User goal
- Main user flow
- Required screens
- Required backend APIs
- Required database changes
- Existing files/patterns to follow

Do not start coding until the affected areas are clear.

## Step 2: Inspect Existing Architecture

Look for:

- Frontend feature folders
- Existing screens/components
- Existing API client pattern
- Existing TypeScript types
- Backend router pattern
- Backend schema pattern
- Backend service pattern
- Database model pattern
- Central router registration

Follow existing project style.

## Step 3: Design the Vertical Slice

For each feature, plan:

### Database

- Tables or fields needed
- Relationships
- Defaults
- Indexes only if useful

### Backend

- Model
- Request schema
- Response schema
- Router endpoint
- Service logic
- Error handling
- Swagger/OpenAPI registration

### Frontend

- TypeScript types
- API client function
- Hook/state logic
- Screen/component
- Form validation
- Loading state
- Error state
- Empty state
- Success behavior

## Step 4: Implement Backend First

For FastAPI:

- Use APIRouter.
- Add tags.
- Add summary.
- Add status_code.
- Add response_model where applicable.
- Keep route handlers thin.
- Put business logic in service layer if project uses services.
- Include the router in the central API router.
- Ensure endpoint appears in `/docs` and `/openapi.json`.

## Step 5: Implement Frontend Second

For React Native:

- Use TypeScript.
- Keep screens thin.
- Use reusable components where useful.
- Keep API calls in API layer or hooks.
- Avoid putting complex logic directly inside JSX.
- Handle loading, error, empty, and success states.
- Keep mobile UX simple and touch-friendly.

## Step 6: Keep API Contract Aligned

Check:

- Backend response fields
- Frontend TypeScript types
- snake_case vs camelCase mapping
- Required/optional fields
- Error response shape

Do not assume fields. Confirm from schemas.

## Step 7: Verify

Run relevant checks if available:

- Backend tests
- FastAPI app startup
- OpenAPI route check
- TypeScript check
- React Native build/start
- Lint command if available

If commands are unknown, inspect package files or README first.

## Step 8: Final Report

Always finish with:

1. Feature implemented
2. Files changed
3. Backend endpoints
4. Frontend screens/components
5. Database changes
6. How to test
7. Risks or assumptions

Keep the report clear and short.
