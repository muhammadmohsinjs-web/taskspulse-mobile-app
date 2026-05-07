# Senior Execution Plan: Full CRUD for Tasks, Goals & Habits

## 1. Task Overview

Complete the remaining frontend CRUD support for tasks, goals, and habits. The backend already has full CRUD endpoints — the missing work is frontend UX.

**Expected final behavior:**
- Tasks support create, read/list, update (via three-state toggle + form), delete in frontend.
- Tasks have three states: `todo` → `in_progress` → `done`.
- Goals support create, read/list/detail, update (via edit form), delete in frontend.
- Habits support create, read/list, update (via edit form), delete in frontend.
- Habits have two daily states: `done` / `not done` (via completion toggle).

**In scope:**
- Frontend UI and hook usage for missing update flows.
- Keep existing backend API contracts.
- Verify backend endpoints are already registered in OpenAPI.
- Run backend and frontend verification commands.

**Out of scope:**
- Adding new database tables.
- Adding new dependencies.
- Redesigning navigation or app architecture.
- Changing authentication behavior.
- Changing habit completion from daily to permanent status field.

---

## 2. Current Architecture Observations

### Backend

- FastAPI entrypoint is `backend/main.py`.
- Routers are included with prefixes: `/tasks`, `/goals`, `/habits`.
- Modules follow this pattern:
  - `backend/modules/<feature>/models.py`
  - `backend/modules/<feature>/schemas.py`
  - `backend/modules/<feature>/service.py`
  - `backend/modules/<feature>/router.py`
- Tasks already have all CRUD endpoints + status filters.
- Goals already have all CRUD endpoints + task linking.
- Habits already have all CRUD endpoints + daily completion + streak tracking.

**Task schemas** restrict status to `todo`, `in_progress`, `done`.

**Habit daily state** is represented by `completed_today` (backend) / `completedToday` (frontend).

### Frontend

- React Native + TypeScript + Expo.
- Server state uses TanStack Query.
- API files live under `frontend/src/features/<feature>/api`.
- Hooks live under `frontend/src/features/<feature>/hooks`.
- Screens live under `frontend/src/features/<feature>/screens`.
- Shared UI components live under `frontend/src/components/ui`.
- Types live under `frontend/src/types`.
- `tasksApi`, `goalsApi`, `habitsApi` already expose CRUD functions.
- `useTasks`, `useGoals`, `useHabits` already expose CRUD mutations.
- `TaskListScreen` already supports create, edit, delete, filters, form modal.
- `TaskFormModal` already exposes all three task states.
- `GoalsListScreen` supports create/delete but not edit.
- `GoalDetailScreen` supports delete and linked task operations but not editing goals.
- `HabitsListScreen` supports create/delete/toggle completion but not edit.
- `HabitRow` toggles completion on press, deletes on long press.

---

## 3. Assumptions

- **Assumption 1:** "Habbits" means `habits`.
- **Assumption 2:** Habit `done` / `not done` means today's completion state, already represented by `completedToday`.
- **Risky assumption:** The user does not require a permanent habit status field independent of date. Stop and ask if that is required.

---

## 4. Architecture Protection Rules

- Do not add new dependencies.
- Do not change backend database models unless the user explicitly confirms habit state must be permanent.
- Do not move or rename existing files.
- Do not change API paths.
- Do not bypass existing API modules and hooks.
- Do not put raw `fetch` calls inside screens.
- Do not rewrite navigation.
- Do not modify auth files.
- Do not modify generated, cache, `.env`, or lock files.
- Keep changes focused to task/goal/habit CRUD UX.
- Preserve existing theme tokens from `frontend/src/theme/theme.ts`.
- Use existing `Modal`, `Button`, `FAB`, `EmptyState`, and row/card patterns.

---

## 5. Allowed Files

| File Path | Action | Purpose |
|---|---|---|
| `frontend/src/features/tasks/screens/TaskListScreen.tsx` | UPDATE | Make status toggle cycle through all three states |
| `frontend/src/features/tasks/components/TaskRow.tsx` | UPDATE | Show `in_progress` state clearly |
| `frontend/src/features/goals/components/GoalFormModal.tsx` | CREATE | Shared create/edit goal form |
| `frontend/src/features/goals/screens/GoalsListScreen.tsx` | UPDATE | Use goal form modal for create |
| `frontend/src/features/goals/screens/GoalDetailScreen.tsx` | UPDATE | Support editing goal details |
| `frontend/src/features/habits/components/HabitFormModal.tsx` | CREATE | Shared create/edit habit form |
| `frontend/src/features/habits/components/HabitRow.tsx` | UPDATE | Separate press/edit from completion toggle |
| `frontend/src/features/habits/screens/HabitsListScreen.tsx` | UPDATE | Use habit form modal and support edit |

---

## 6. Forbidden Files and Areas

| Path | Reason |
|---|---|
| `frontend/.env` | Secrets/config must not be touched |
| `frontend/package.json` | No dependency changes needed |
| `frontend/package-lock.json` | No dependency changes needed |
| `backend/modules/auth/` | Auth unrelated |
| `backend/modules/tasks/models.py` | Existing states already support all three |
| `backend/modules/goals/models.py` | Existing CRUD already supported |
| `backend/modules/habits/models.py` | Do not add permanent habit state without clarification |
| `.git/` | Never edit git internals |
| `**/__pycache__/` | Generated files |
| `frontend/src/navigation/RootNavigator.tsx` | No navigation changes needed |

---

## 7. Subtask Breakdown

---

### Subtask 1: Verify Backend CRUD Coverage

#### Goal

Confirm backend already supports CRUD for tasks, goals, and habits.

#### Allowed Files

No files may be changed.

#### Instructions

1. Read:
   - `backend/main.py`
   - `backend/modules/tasks/router.py`
   - `backend/modules/goals/router.py`
   - `backend/modules/habits/router.py`
2. Confirm all expected CRUD endpoints exist.
3. Confirm task status schemas use `todo`, `in_progress`, `done`.
4. Confirm habit completion uses `completed_today`, `POST /habits/{habit_id}/complete`, and `DELETE /habits/{habit_id}/complete`.

#### Validation

```bash
cd backend && python -m pytest
```

#### Stop Conditions

- Stop if any CRUD endpoint is missing.
- Stop if task statuses differ from `todo`, `in_progress`, `done`.
- Stop if habit completion is not represented by `completed_today`.

---

### Subtask 2: Improve Task Three-State Frontend Support

#### Goal

Ensure the task list cycles through all three task states from the main row interaction.

#### Allowed Files

- `frontend/src/features/tasks/screens/TaskListScreen.tsx`
- `frontend/src/features/tasks/components/TaskRow.tsx`

#### Instructions

1. In `TaskListScreen.tsx`, update `handleToggle`.
2. Change the state progression to:
   - `todo` → `in_progress`
   - `in_progress` → `done`
   - `done` → `todo`
3. Keep existing mutation and error handling.
4. In `TaskRow.tsx`, show an "In Progress" label/badge when `task.status === "in_progress"`.
5. Preserve the existing done visual style.

#### Required Changes

In `TaskListScreen.tsx`, replace:
```ts
const nextStatus = task.status === "done" ? "todo" : "done";
```
With:
```ts
const nextStatus =
  task.status === "todo"
    ? "in_progress"
    : task.status === "in_progress"
      ? "done"
      : "todo";
```

In `TaskRow.tsx`, add a visible label for `in_progress` in the meta row.

#### Validation

```bash
cd frontend && npm run typecheck
```

Manual check:
- Tap todo task → becomes in progress.
- Tap again → becomes done.
- Tap again → returns to todo.
- Status filters still work.

---

### Subtask 3: Create Shared Goal Form Modal

#### Goal

Create one reusable goal form modal for create and edit.

#### Allowed Files

- `frontend/src/features/goals/components/GoalFormModal.tsx`

#### Instructions

1. Create `GoalFormModal.tsx` in the existing goals components folder.
2. Use existing `Modal`, `Button`, `theme`, and `COLORS`.
3. Props:
   - `visible`, `onClose`, `onSave`, `editingGoal`, `saving`
4. Form fields: title, description, target date, color.
5. Validate:
   - title is required
   - target date must pass `isValidDateString`
6. On save, submit:
   - `title`, `description`, `targetDate: string | null`, `color`
7. Reset form values when opened or when `editingGoal` changes.

#### Validation

```bash
cd frontend && npm run typecheck
```

---

### Subtask 4: Use Goal Form Modal in Goals List Screen

#### Goal

Replace inline create modal with `GoalFormModal` for create.

#### Allowed Files

- `frontend/src/features/goals/screens/GoalsListScreen.tsx`
- `frontend/src/features/goals/components/GoalFormModal.tsx`

#### Instructions

1. Import `GoalFormModal`.
2. Replace inline create modal with `GoalFormModal`.
3. FAB opens create mode (no `editingGoal`).
4. Preserve:
   - normal press → navigate to detail
   - long press → delete confirmation
5. Keep delete via `useDeleteGoal`.

#### Validation

```bash
cd frontend && npm run typecheck
```

Manual check:
- Create goal still works.
- Delete goal still works.
- Pull-to-refresh works.

---

### Subtask 5: Add Goal Edit Support in Goal Detail Screen

#### Goal

Allow editing goal title, description, target date, and color from the goal detail screen.

#### Allowed Files

- `frontend/src/features/goals/screens/GoalDetailScreen.tsx`
- `frontend/src/features/goals/components/GoalFormModal.tsx`

#### Instructions

1. Import `GoalFormModal` and `useUpdateGoal`.
2. Add local state: `editModalVisible`, `savingGoal`.
3. Add an "Edit" button next to the existing "Delete" button in the goal header.
4. On edit save:
   ```ts
   updateGoal.mutateAsync({ id: goalId, payload })
   ```
5. After save: close modal, refetch goal.

#### Validation

```bash
cd frontend && npm run typecheck
```

Manual check:
- Open goal detail → tap Edit → change fields → save → detail updates.
- Back to goals list shows updated goal.

---

### Subtask 6: Create Shared Habit Form Modal

#### Goal

Create one reusable habit form modal for create and edit.

#### Allowed Files

- `frontend/src/features/habits/components/HabitFormModal.tsx`

#### Instructions

1. Create `HabitFormModal.tsx` in the existing habits components folder.
2. Use existing `Modal`, `Button`, `theme`, `COLORS`, `CategoryChip`, `useCategories`.
3. Props:
   - `visible`, `onClose`, `onSave`, `editingHabit`, `saving`
4. Form fields: title, description, category, color.
5. Preserve recurrence rule.
6. Validate title is required.
7. Reset form values when opened or when `editingHabit` changes.

#### Validation

```bash
cd frontend && npm run typecheck
```

---

### Subtask 7: Add Habit Edit Support

#### Goal

Allow editing habit details while preserving daily done/not done toggle.

#### Allowed Files

- `frontend/src/features/habits/screens/HabitsListScreen.tsx`
- `frontend/src/features/habits/components/HabitRow.tsx`
- `frontend/src/features/habits/components/HabitFormModal.tsx`

#### Instructions

1. Update `HabitRowProps` to include `onPress?: () => void`.
2. Row press → calls `onPress` (opens edit modal).
3. Checkbox area → calls `onToggle` (completes/undoes habit).
4. Long press → delete.
5. In `HabitsListScreen.tsx`:
   - Import `useUpdateHabit`, `HabitFormModal`.
   - Track `editingHabit`, `modalVisible`, `saving`.
   - FAB opens create mode.
   - Row press opens edit mode.
   - Checkbox toggles done/not done.
   - Long press deletes.
6. On save:
   - If editing → `updateHabit.mutateAsync({ id, payload })`
   - If creating → `createHabit.mutateAsync(payload)`

#### Validation

```bash
cd frontend && npm run typecheck
```

Manual check:
- Tap checkbox → toggles done/not done.
- Tap habit row → opens edit modal.
- Edit → save → updates list.
- Long press → delete confirmation.
- Create habit still works.

---

### Subtask 8: Final Verification

#### Goal

Verify the full CRUD implementation is safe.

#### Instructions

```bash
cd frontend && npm run typecheck
```

```bash
cd backend && python -m pytest
```

Optionally verify OpenAPI:
```bash
cd backend && uvicorn main:app --reload
```
Open `http://localhost:8000/openapi.json` — confirm `/tasks`, `/goals`, `/habits` CRUD paths exist.

---

## 8. Detailed File Change Plan

### File: `frontend/src/features/tasks/screens/TaskListScreen.tsx`

**Action:** UPDATE

Change only `handleToggle`:

```ts
// Before:
const nextStatus = task.status === "done" ? "todo" : "done";

// After:
const nextStatus =
  task.status === "todo"
    ? "in_progress"
    : task.status === "in_progress"
      ? "done"
      : "todo";
```

### File: `frontend/src/features/tasks/components/TaskRow.tsx`

**Action:** UPDATE

Add an "In Progress" label in the `metaRow` when `task.status === "in_progress"`. Keep the existing `Done` label and checkbox behavior.

### File: `frontend/src/features/goals/components/GoalFormModal.tsx`

**Action:** CREATE

Reusable modal accepting `editingGoal` (optional). Form fields: title, description, target date, color. Uses `GoalCreatePayload` / `GoalUpdatePayload` shape.

### File: `frontend/src/features/goals/screens/GoalsListScreen.tsx`

**Action:** UPDATE

Replace inline create form/modal with `GoalFormModal`. Keep normal press → navigate, long press → delete.

### File: `frontend/src/features/goals/screens/GoalDetailScreen.tsx`

**Action:** UPDATE

Add edit button -> `GoalFormModal`. Use `useUpdateGoal`. Refetch after save.

### File: `frontend/src/features/habits/components/HabitFormModal.tsx`

**Action:** CREATE

Reusable modal accepting `editingHabit` (optional). Form fields: title, description, category, color. Uses `HabitCreatePayload` / `HabitUpdatePayload` shape.

### File: `frontend/src/features/habits/components/HabitRow.tsx`

**Action:** UPDATE

Add `onPress` prop. Checkbox area → `onToggle`. Row press → `onPress`. Long press kept for delete.

### File: `frontend/src/features/habits/screens/HabitsListScreen.tsx`

**Action:** UPDATE

Replace inline create modal with `HabitFormModal`. Row press opens edit. Checkbox toggles. Long press deletes.

---

## 9. Validation Matrix

| Resource | Backend Status | Frontend Status After Plan |
|---|---|---|
| Tasks create | Already supported | Already supported |
| Tasks read/list | Already supported | Already supported |
| Tasks update | Already supported | Supported via form + three-state toggle |
| Tasks delete | Already supported | Already supported via long press |
| Goals create | Already supported | Supported |
| Goals read/list/detail | Already supported | Supported |
| Goals update | Already supported | Edit modal on detail screen |
| Goals delete | Already supported | Already supported |
| Habits create | Already supported | Supported |
| Habits read/list | Already supported | Supported |
| Habits update | Already supported | Edit modal on row press |
| Habits delete | Already supported | Already supported |
| Habit done/not done | Already supported (completion endpoints) | Preserve checkbox toggle |
