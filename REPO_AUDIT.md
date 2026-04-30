# Repo Audit Report: TasksPulse

## Critical / High Severity Bugs

### 1. `Task.goal_id` Filtered But Column Does Not Exist
**File:** `backend/modules/tasks/service.py:24`

The `get_tasks()` function accepts a `goal_id` parameter and filters on `Task.goal_id`, but the `Task` model (`tasks/models.py`) has **no `goal_id` column**. Passing a `goal_id` would cause an `AttributeError` at runtime. The router does not expose this parameter, so it is unreachable in normal use — but dead code that would crash if called.

### 2. Hard Delete on Categories vs. Soft Delete on Tasks/Habits
**Files:** `categories/service.py:38`, `tasks/service.py:61`, `habits/service.py:43`

Categories use `db.delete()` (hard/physical delete). Tasks and habits use a `deleted_at` timestamp (soft delete). When a category is hard-deleted, any task or habit referencing that `category_id` is left with a **dangling foreign key reference**. There is no cascade or cleanup.

### 3. RefreshControl Uses `isLoading` Instead of Tracking Refreshing State
**Files:** `HabitsListScreen.tsx:97`, `CategoriesScreen.tsx:125`, `DailyCockpitScreen.tsx:201`

All three screens pass `refreshing={isLoading}` to `RefreshControl`. After the initial load, `isLoading` is `false` forever, so **pull-to-refresh never shows the spinner**. The data silently refreshes with no visual feedback.

### 4. HabitStreak `longest_streak` Not Correctly Resets When All Logs Deleted
**File:** `backend/modules/habits/service.py:128-132`

When `_recalculate_streak` finds zero logs, it sets `current_streak = 0` and `last_completed_date = None`, but **leaves `longest_streak` unchanged**. If a user deletes all completions, the habit still shows an inflated "best ever" value.

---

## Medium Severity Bugs

### 5. `datetime.utcnow()` Deprecated
**Files:** `tasks/service.py:47,63`, `habits/service.py:43`

`datetime.utcnow()` is deprecated as of Python 3.12. Should use `datetime.now(datetime.timezone.utc)`.

### 6. No Error UI for Habit Toggles from Cockpit
**File:** `DailyCockpitScreen.tsx:29-33`

`handleHabitToggle` calls `toggleHabit.mutate()` but never handles errors. If the API call fails (network down, habit deleted), the user sees no visual feedback or error message.

### 7. Duplicate Category Name Causes Unhandled 500
**Files:** `categories/models.py:14` (`unique=True`), `categories/service.py:14-19`

`Category.name` is marked `unique=True`. Creating a duplicate name raises an `IntegrityError`, which is not caught. The API returns an unhelpful **HTTP 500** instead of a **409 Conflict**.

### 8. CORS `allow_credentials=True` with `allow_origins=["*"]`
**File:** `backend/main.py:16`

This combination is disallowed by modern browsers and flagged by security scanners.

### 9. `generate_uuid()` Duplicated in Three Model Files
**Files:** `tasks/models.py:6-7`, `categories/models.py:6-7`, `habits/models.py:6-7`

Identical function defined in three places. Should be in a shared `utils.py`.

### 10. Date Fields Stored as Strings Instead of Native Types
**Files:** `tasks/models.py:18,21-22`, `habits/models.py:30`, `habits/streaks:41`

`due_date`, `completed_at`, `deleted_at`, `completed_date`, `last_completed_date` are all `Column(String)` instead of `Column(Date)` or `Column(DateTime)`. This prevents proper SQL date comparisons, range queries, and indexing.

---

## Edge Cases

### 11. Timezone-Unaware Date Calculations
**File:** `habits/service.py:53,136-137`

Uses `date.today()` everywhere — server-local time. If the backend is UTC but the user is in a different timezone, habit streaks split/break at UTC midnight, not the user's midnight. No timezone parameter exists anywhere.

### 12. Rapid Habit Toggles Could Cause Streak Calculation Race
**File:** `habits/service.py:67`

Each `complete_habit`/`undo_completion` call triggers `_recalculate_streak`, which does multiple queries. Rapid toggling could cause incorrect streak values due to transaction sequencing on SQLite's single-writer model.

### 13. No JSON Validation on `recurrence_rule`
**File:** `habits/schemas.py:9`

`recurrence_rule` is typed as `str` with a default JSON string, but there is no validation that the input is valid JSON. Invalid JSON would be stored silently and crash consumers that try to parse it.

### 14. Modal State Leaks When Closed via Overlay Tap
**Files:** `HabitsListScreen.tsx`, `CategoriesScreen.tsx`

The modal's `onClose` prop just sets `modalVisible=false` — it does NOT reset form fields. If a user partially fills a form, closes the modal, and reopens via FAB, the old form state persists.

### 15. Empty Habit List Behavior in Cockpit
**File:** `cockpit/service.py:69`

When `total_habits = 0`, `streak_active` is `False` and completion rate is 0%. An empty state saying "No habits yet" with a 0% progress bar could confuse users.

---

## Loose Patterns & Architecture Issues

### 16. Cockpit Endpoint Does N+1 Queries
**File:** `cockpit/router.py:10-12`

The cockpit endpoint always computes from live data with no caching. Every cockpit load triggers one query per habit for streak + completed_today. For 20 habits, that is 41+ separate DB queries per refresh.

### 17. Navigation Typed as `any`
**File:** `DailyCockpitScreen.tsx:24`

`useNavigation<any>()` bypasses all TypeScript navigation type safety. If screen names change, navigation calls silently fail at runtime.

### 18. Path Alias `@/*` Configured but Never Used
**Files:** All frontend files

`tsconfig.json` defines `@/* -> src/*`, but every import uses relative paths like `"../../types"`.

### 19. Inconsistent API Payload Construction
**Files:** `habitsApi.ts:16-20`, `tasksApi.ts:21-27`, `categoriesApi.ts:11-14`

Each API module manually builds snake_case body objects with individual `if` checks. A shared `toSnakeCase()` mapper would eliminate duplication.

### 20. `enableScreens(false)` Disables Performance Optimization
**File:** `frontend/index.ts:6`

Disables `react-native-screens`, losing native stack optimizations — likely a workaround for patches.

### 21. `SafeAreaWrapper` Defined but Never Used
**File:** `frontend/src/components/ui/SafeAreaWrapper.tsx`

The component exists but is never imported by any screen.

### 22. No `onError` in React Query Mutation Hooks
**Files:** `useHabits.ts`, `useTasks.ts`, `useCategories.ts`

Mutations define `onSuccess` but never `onError`. Mutations called without `try/catch` (like habit toggle from cockpit) have no error feedback.

### 23. No Migration Framework
The SQLite database uses `create_all()` at startup — no schema migrations. The `migrations/` folder is empty. Schema evolution is fragile.

### 24. Health Check Doesn't Verify DB Connectivity
**File:** `backend/main.py:28-30`

The `/health` endpoint returns `{"status": "ok"}` unconditionally — it does not verify the database connection.

---

## Summary Table

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | CRITICAL | Backend | `Task.goal_id` filter but no column in model |
| 2 | HIGH | Backend | Hard delete (categories) vs soft delete (tasks/habits) — dangling refs |
| 3 | HIGH | Frontend | `RefreshControl` uses `isLoading` — no spinner on pull-to-refresh |
| 4 | HIGH | Backend | `longest_streak` not reset when all habit logs deleted |
| 5 | MEDIUM | Backend | `datetime.utcnow()` deprecated |
| 6 | MEDIUM | Frontend | No error UI for habit toggles from cockpit |
| 7 | MEDIUM | Backend | Duplicate category name → unhandled 500 |
| 8 | MEDIUM | Backend | CORS `*` + `credentials=True` |
| 9 | MEDIUM | Both | `generate_uuid()` duplicated 3 times |
| 10 | MEDIUM | Backend | Date fields stored as strings, not native date types |
| 11 | MEDIUM | Backend | No timezone awareness in habit streak calculations |
| 12 | MEDIUM | Backend | Rapid habit toggles could cause streak race conditions |
| 13 | LOW | Backend | No JSON validation on `recurrence_rule` |
| 14 | LOW | Frontend | Modal form state leaks on overlay-tap close |
| 15 | LOW | Backend | Empty cockpit shows 0% progress bar confusingly |
| 16 | LOW | Backend | Cockpit does N+1 queries per habit |
| 17 | LOW | Frontend | Navigation typed as `any` |
| 18 | LOW | Frontend | Path alias `@/*` configured but unused |
| 19 | LOW | Frontend | Inconsistent API payload construction per module |
| 20 | LOW | Frontend | `enableScreens(false)` disables native optimizations |
| 21 | LOW | Frontend | `SafeAreaWrapper` defined but unused |
| 22 | LOW | Frontend | No `onError` in React Query mutation hooks |
| 23 | LOW | Backend | No migration framework (`create_all` at startup) |
| 24 | LOW | Backend | Health check doesn't verify DB connectivity |
