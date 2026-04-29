# TasksPulse Mobile App — Architecture Plan

## 1. Product Understanding

TasksPulse is a **calendar-first daily productivity mobile cockpit** for individual knowledge workers. It consolidates **habits, tasks, goals, and calendar events** into a single mobile workflow. The core value proposition is a _Daily Cockpit_ screen where a user sees today's habits and tasks, toggles completion with one tap, and is protected against streak breaks.

**Positioning:** "TasksPulse is an AI-powered daily productivity coach that plans your day, protects your streaks, and keeps your goals on track — all connected to your calendar."

**Target users:** Individual knowledge workers, tech professionals, freelancers, productivity enthusiasts. Single-player (no teams, no sharing, no multi-tenancy in MVP).

**Monetization:** Freemium B2C with a $15-30/month Pro tier (deferred — billing not in MVP).

### Source of Truth
`BUSINESS_IDEAS_FROM_REPOSITORY.md` — the #1 recommended idea is an **AI-Powered Daily Productivity Coach**, with the mobile app as the delivery surface.

---

## 2. Assumptions

1. **Single user, no auth** — MVP has zero authentication. The backend serves one local user.
2. **Local-first, network-backed** — Data served via FastAPI backend (no offline sync in MVP).
3. **Mobile-first** — Designed for phone usage. Tablet not a priority.
4. **No billing yet** — Stripe, subscription tiers, and tier gating are Phase 6+ concerns.
5. **Calendar integration deferred** — Google Calendar OAuth is blocked by verification requirements.
6. **AI features deferred** — AI command bar, AI planning, AI analytics not in MVP.
7. **TypeScript migration** — New files are TypeScript. Legacy `HomeScreen.js` replaced.
8. **Expo managed workflow** — No native modules needed for MVP features.

---

## 3. Core User Flows

### Flow 1: Daily Morning Ritual
```
Open app → Land on Daily Cockpit → See today's habits (unchecked) + today's tasks
→ Tap habit to complete → Streak count increments
→ Tap task to toggle → Strikethrough applied
→ Scroll to see all items → Repeat through the day
→ After 5 PM: streak protection nudges for unfinished habits
```

### Flow 2: Task Creation & Scheduling
```
Cockpit or Calendar → Tap "+" → Enter title, description, due date, category
→ Task appears in today's list AND on calendar date
```

### Flow 3: Goal Creation & Task Linking
```
Goals tab → Create goal (title, target, deadline) → Progress bar at 0%
→ Create or link existing tasks → Progress bar auto-updates as tasks complete
→ Filter goals by status (active/completed/at-risk)
```

### Flow 4: Habit Setup
```
More tab → Habits → Create habit (title, recurrence, category)
→ Habit appears daily on Cockpit → Track streak over time
```

### Flow 5: Monthly Calendar View
```
Calendar tab → See month grid → Tapped dates show tasks
→ Color-coded completion density → Tap date to add task
```

### Flow 6: Backlog Management
```
Backlog tab → See unscheduled tasks (no due date) → Search, filter by goal
→ Schedule task to a date → Moves from backlog to calendar
```

---

## 4. Domain Modules

| # | Module | Core Entities | Primary User Action |
|---|--------|--------------|---------------------|
| 1 | **Daily Cockpit** | Today's habits + tasks (aggregate view) | View today, toggle completion |
| 2 | **Habits** | Habit, HabitLog, HabitStreak | Create, toggle, track streaks |
| 3 | **Tasks** | Task (scheduled + unscheduled) | Create, schedule, complete, delete |
| 4 | **Goals** | Goal, GoalTaskLink | Create, set target, link tasks, track progress |
| 5 | **Categories** | Category | Create, color-code, assign to habits/tasks |
| 6 | **Streaks** | HabitStreak (derived from HabitLog) | View streak counts, streak protection |
| 7 | **Recurrence** | RecurrenceRule (on Habit + Task) | Set daily/weekly/monthly recurrence |
| 8 | **Planning** | Weekly capacity, Focus queue | Auto-balance week, carry-forward overdue |
| 9 | **Analytics** | Aggregated stats (read-only queries) | Habit performance, goal progress, trends |

**Module dependency graph:**
```
Categories → Habits, Tasks, Goals
Habits → HabitLogs → Streaks
Recurrence → Habits, Tasks
Goals → Tasks (via goal_task_links)
Tasks → DailyCockpit, Calendar, Backlog, Planning, Analytics
HabitLogs → Analytics, Streaks
```

---

## 5. Recommended Architecture

**Overall: Modular Monolith Backend + Feature-Based Frontend + Vertical Slice Delivery**

### Why This Fits

| Concern | Solution | Rationale |
|---------|----------|-----------|
| Backend organization | Modules per domain (`modules/habits/`, `modules/tasks/`, etc.) | Scales from current single-file backend to ~10+ files while staying in one process |
| Frontend organization | Feature-based folders (`src/features/habits/`) | Colocate screens, components, hooks, and API calls per feature |
| Delivery strategy | Vertical slices (full feature end-to-end) | Validate each slice before moving to next |
| API protocol | REST (existing pattern) | Well-understood, already in codebase |
| Database | SQLite via SQLAlchemy | Zero setup, single-file, easy to switch to Postgres later |
| Server state | React Query (TanStack Query) | Caching, refetch, optimistic updates for server data |
| UI state | useState / useReducer | Local and ephemeral — not shared across screens |

---

## 6. Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Router → Schema → Service → Model** | Backend per module | FastAPI idiomatic; business logic separate from HTTP |
| **Service Layer** | Backend `service.py` per module | Testable without HTTP; reusable across endpoints |
| **Custom Hooks** | Frontend `hooks/` per feature | Extract data fetching/mutation from screens |
| **Optimistic Updates** | Frontend via React Query | Instant UI feedback on habit/task toggle; rollback on error |
| **Compound Components** | Frontend UI | `HabitRow`, `TaskRow`, `StreakBadge` as focused composable pieces |
| **Derived State** | Streaks from HabitLogs | One write path; streaks recomputed, not manually written |
| **UUID IDs** | All models | Avoids integer collision; future-proof for offline sync |
| **Soft Delete** | Tasks, Habits, Goals | `deleted_at` column; recoverable deletions |

---

## 7. Frontend Architecture

### Navigation Structure

```
NavigationContainer
└── BottomTabNavigator
    ├── Tab: "Today"     → DailyCockpitStack
    │   └── DailyCockpitScreen
    ├── Tab: "Calendar"  → CalendarStack
    │   ├── MonthlyCalendarScreen
    │   └── DateDetailScreen
    ├── Tab: "Goals"     → GoalsStack
    │   ├── GoalsListScreen
    │   └── GoalDetailScreen
    ├── Tab: "Backlog"   → BacklogStack
    │   └── BacklogScreen
    └── Tab: "More"      → MoreStack
        ├── HabitsListScreen
        ├── CategoriesScreen
        ├── AnalyticsScreen
        └── SettingsScreen
```

### Screen-Component-Hook Layering (per feature)

```
src/features/habits/
├── screens/
│   └── HabitsListScreen.tsx          ← Thin layout, composition only
├── components/
│   ├── HabitRow.tsx                  ← Single habit with tap-to-complete
│   ├── HabitFormModal.tsx            ← Create/Edit form
│   └── StreakBadge.tsx               ← Streak count display
├── hooks/
│   ├── useHabits.ts                  ← React Query: CRUD
│   └── useHabitStreak.ts             ← Derived streak data
└── api/
    └── habitsApi.ts                  ← Raw fetch calls to /habits
```

### State Management

| State Type | Tool | Why |
|-----------|------|-----|
| Server state (tasks, habits, goals) | React Query `@tanstack/react-query` | Caching, background refetch, optimistic updates, deduplication |
| UI state (modals, form inputs, filters) | `useState` / `useReducer` | Local and ephemeral |
| Navigation state | React Navigation built-in | Handles stack/tab state natively |
| Global/cross-screen state | None in MVP | Cross-data aggregation handled by individual React Query hooks |

### API Layer

```
src/services/
└── apiClient.ts          ← Base fetch wrapper (timeout, error handling, base URL discovery)

src/features/*/api/
├── habitsApi.ts          ← getHabits(), createHabit(), toggleHabit(), ...
├── tasksApi.ts           ← getTasks(), createTask(), updateTask(), ...
├── goalsApi.ts           ← getGoals(), createGoal(), linkTaskToGoal(), ...
├── categoriesApi.ts      ← getCategories(), createCategory(), ...
└── cockpitApi.ts         ← getCockpit()
```

**Type mapping:** Backend `snake_case` → Frontend `camelCase` via `mapHabit()` / `mapTask()` transformers at the API boundary.

### Design System

```
src/components/ui/        ← Shared primitives
├── Button.tsx
├── Card.tsx
├── Badge.tsx
├── TextInput.tsx
├── Modal.tsx
├── EmptyState.tsx
├── LoadingSpinner.tsx
├── ProgressBar.tsx
├── ConfirmDialog.tsx
└── SafeAreaWrapper.tsx

src/theme/
└── theme.ts              ← Colors, spacing, typography tokens
```

**Visual style (follows existing `HomeScreen.js`):**
- Accent: `#4A90D9` (blue)
- Dark text: `#1A1A2E`
- Background: `#F5F7FA`
- Cards: white with 8px radius
- Danger: `#EF4444` (red)
- Muted text: `#9CA3AF`

---

## 8. Backend Architecture

### From Single File → Modular Monolith

**Current:** `main.py` (56 lines, all in one file)

**Target:** Each domain module gets its own package:

```
backend/
├── main.py                          ← App factory, CORS, router registration
├── database.py                      ← Engine, SessionLocal, Base
├── requirements.txt
├── migrations/                      ← Numbered .sql migration files
│   ├── 001_add_categories.sql
│   ├── 002_add_habits.sql
│   └── ...
└── modules/
    ├── __init__.py
    ├── tasks/
    │   ├── __init__.py
    │   ├── router.py                ← /tasks endpoints
    │   ├── schemas.py               ← TaskCreate, TaskUpdate, TaskOut
    │   ├── service.py               ← Business logic
    │   └── models.py                ← Task ORM model
    ├── habits/
    │   ├── __init__.py
    │   ├── router.py                ← /habits endpoints
    │   ├── schemas.py               ← HabitCreate, HabitUpdate, HabitOut, HabitLogOut
    │   ├── service.py               ← Completion logic, streak calculation
    │   └── models.py                ← Habit, HabitLog, HabitStreak ORM
    ├── goals/
    │   ├── __init__.py
    │   ├── router.py                ← /goals endpoints
    │   ├── schemas.py               ← GoalCreate, GoalUpdate, GoalOut
    │   ├── service.py               ← Progress calculation
    │   └── models.py                ← Goal, GoalTaskLink ORM
    ├── categories/
    │   ├── __init__.py
    │   ├── router.py                ← /categories endpoints
    │   ├── schemas.py
    │   ├── service.py
    │   └── models.py                ← Category ORM
    ├── cockpit/
    │   ├── __init__.py
    │   ├── router.py                ← /cockpit endpoint
    │   ├── schemas.py               ← DailyCockpitOut
    │   └── service.py               ← Aggregation logic
    ├── analytics/                   ← Phase 4
    └── planning/                    ← Phase 5
```

### Router Registration (`main.py`)

```python
from modules.tasks.router      import router as tasks_router
from modules.habits.router     import router as habits_router
from modules.goals.router      import router as goals_router
from modules.categories.router import router as categories_router
from modules.cockpit.router    import router as cockpit_router

app.include_router(tasks_router,      prefix="/tasks",      tags=["tasks"])
app.include_router(habits_router,     prefix="/habits",     tags=["habits"])
app.include_router(goals_router,      prefix="/goals",      tags=["goals"])
app.include_router(categories_router, prefix="/categories", tags=["categories"])
app.include_router(cockpit_router,    prefix="/cockpit",    tags=["cockpit"])
```

### Service Layer Pattern

```python
# backend/modules/habits/service.py
from sqlalchemy.orm import Session
from datetime import date, timedelta

def complete_habit(db: Session, habit_id: str, completion_date: date = None):
    """Mark habit complete for a date. Creates HabitLog, recalculates streak."""
    completion_date = completion_date or date.today()

    # 1. Validate habit exists and isn't deleted
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()
    if not habit:
        raise NotFoundError("Habit not found")

    # 2. Check if already completed (idempotent)
    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_date == completion_date.isoformat()
    ).first()
    if existing:
        return existing

    # 3. Create HabitLog
    log = HabitLog(habit_id=habit_id, completed_date=completion_date.isoformat())
    db.add(log)

    # 4. Recalculate streak (consecutive days)
    streak = db.query(HabitStreak).filter(HabitStreak.habit_id == habit_id).first()
    if not streak:
        streak = HabitStreak(habit_id=habit_id)
        db.add(streak)

    # Find consecutive days from last_completed_date
    yesterday = (completion_date - timedelta(days=1)).isoformat()
    if streak.last_completed_date == yesterday:
        streak.current_streak += 1
    elif streak.last_completed_date != completion_date.isoformat():
        streak.current_streak = 1

    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_completed_date = completion_date.isoformat()

    db.commit()
    db.refresh(log)
    return log
```

### API Endpoint Specification

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| `GET` | `/health` | Root | Health check |
| `GET` | `/cockpit` | Cockpit | Today's habits + tasks + global streak |
| `GET` | `/habits` | Habits | List all habits |
| `POST` | `/habits` | Habits | Create habit |
| `PUT` | `/habits/{id}` | Habits | Update habit |
| `DELETE` | `/habits/{id}` | Habits | Soft-delete habit |
| `POST` | `/habits/{id}/complete` | Habits | Mark habit complete for today |
| `DELETE` | `/habits/{id}/complete` | Habits | Undo today's completion |
| `GET` | `/habits/{id}/streak` | Habits | Get streak info for one habit |
| `GET` | `/tasks` | Tasks | List tasks (`?date=`, `?status=`, `?goal_id=`, `?category_id=`) |
| `POST` | `/tasks` | Tasks | Create task |
| `GET` | `/tasks/{id}` | Tasks | Get task by ID |
| `PUT` | `/tasks/{id}` | Tasks | Update task |
| `DELETE` | `/tasks/{id}` | Tasks | Soft-delete task |
| `GET` | `/goals` | Goals | List goals (`?status=`) |
| `POST` | `/goals` | Goals | Create goal |
| `PUT` | `/goals/{id}` | Goals | Update goal |
| `DELETE` | `/goals/{id}` | Goals | Soft-delete goal |
| `POST` | `/goals/{id}/tasks` | Goals | Link task to goal |
| `DELETE` | `/goals/{id}/tasks/{task_id}` | Goals | Unlink task from goal |
| `GET` | `/categories` | Categories | List categories |
| `POST` | `/categories` | Categories | Create category |
| `PUT` | `/categories/{id}` | Categories | Update category |
| `DELETE` | `/categories/{id}` | Categories | Delete category |

---

## 9. Database Architecture

### Tables

#### tasks (extends existing)
```sql
CREATE TABLE tasks (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'todo',       -- 'todo', 'in_progress', 'done'
    priority        TEXT NOT NULL DEFAULT 'medium',     -- 'low', 'medium', 'high', 'urgent'
    due_date        TEXT,                               -- ISO date '2026-05-01'
    category_id     TEXT REFERENCES categories(id),
    recurrence_rule TEXT,                               -- JSON: {"type":"weekly","days":[1,3,5]}
    completed_at    TEXT,
    deleted_at      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### habits
```sql
CREATE TABLE habits (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT DEFAULT '',
    category_id     TEXT REFERENCES categories(id),
    recurrence_rule TEXT NOT NULL,                      -- JSON: {"type":"daily"} or {"type":"weekly","days":[0,2,4]}
    color           TEXT DEFAULT '#4A90D9',
    deleted_at      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### habit_logs
```sql
CREATE TABLE habit_logs (
    id              TEXT PRIMARY KEY,
    habit_id        TEXT NOT NULL REFERENCES habits(id),
    completed_date  TEXT NOT NULL,                      -- '2026-04-30'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(habit_id, completed_date)                    -- one completion per habit per day
);
```

#### habit_streaks
```sql
CREATE TABLE habit_streaks (
    id                  TEXT PRIMARY KEY,
    habit_id            TEXT NOT NULL UNIQUE REFERENCES habits(id),
    current_streak      INTEGER NOT NULL DEFAULT 0,
    longest_streak      INTEGER NOT NULL DEFAULT 0,
    last_completed_date TEXT,
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### goals
```sql
CREATE TABLE goals (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    description   TEXT DEFAULT '',
    target_metric TEXT DEFAULT '',
    target_value  REAL DEFAULT 0,
    current_value REAL DEFAULT 0,                       -- auto-computed from linked tasks
    status        TEXT NOT NULL DEFAULT 'active',       -- 'active', 'completed', 'at_risk', 'archived'
    deadline      TEXT,
    color         TEXT DEFAULT '#4A90D9',
    deleted_at    TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### goal_task_links
```sql
CREATE TABLE goal_task_links (
    id      TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL REFERENCES goals(id),
    task_id TEXT NOT NULL REFERENCES tasks(id),
    UNIQUE(goal_id, task_id)
);
```

#### categories
```sql
CREATE TABLE categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT NOT NULL DEFAULT '#4A90D9',
    icon        TEXT DEFAULT 'folder',
    applies_to  TEXT NOT NULL DEFAULT 'both',           -- 'task', 'habit', 'both'
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Indexes
```sql
CREATE INDEX idx_tasks_due_date      ON tasks(due_date);
CREATE INDEX idx_tasks_status        ON tasks(status);
CREATE INDEX idx_tasks_category      ON tasks(category_id);
CREATE INDEX idx_tasks_deleted       ON tasks(deleted_at);
CREATE INDEX idx_habits_deleted      ON habits(deleted_at);
CREATE INDEX idx_habit_logs_date     ON habit_logs(completed_date);
CREATE INDEX idx_habit_logs_habit    ON habit_logs(habit_id, completed_date);
CREATE INDEX idx_goals_status        ON goals(status);
CREATE INDEX idx_goal_task_links_g   ON goal_task_links(goal_id);
CREATE INDEX idx_goal_task_links_t   ON goal_task_links(task_id);
```

### Entity Relationships
```
Habit  1──N  HabitLog        (one habit has many daily completions)
Habit  1──1  HabitStreak     (one streak per habit; derived from logs)
Habit  N──1  Category        (optional category)
Task   N──1  Category        (optional category)
Task   N──M  Goal            (via goal_task_links)
Goal   1──N  GoalTaskLink    (one goal links many tasks)
```

### Migration Strategy
- **SQLAlchemy `create_all`** for initial table creation (already in `main.py`)
- **Numbered SQL migration files** in `backend/migrations/` (`001_add_categories.sql`, `002_add_habits.sql`, etc.)
- **Append-only** — never drop columns, only add. Use `deleted_at` for soft deletes.
- **No Alembic** in MVP — SQLite single-user app doesn't need migration framework complexity.

---

## 10. API Contract Strategy

### Schema Alignment

Backend (Python, `snake_case`) and frontend (TypeScript, `camelCase`) use different conventions.

**Approach:** Frontend transforms at the API boundary using mapping functions.

```typescript
// frontend/src/features/habits/api/habitsApi.ts
import { Habit, HabitRaw } from "../../types/habit";

function mapHabit(raw: HabitRaw): Habit {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    categoryId: raw.category_id,
    recurrenceRule: JSON.parse(raw.recurrence_rule),
    color: raw.color,
    deletedAt: raw.deleted_at ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
```

**Alternative (on backend):** Use Pydantic `Field(alias=...)` to accept camelCase inputs:
```python
class HabitCreate(BaseModel):
    title: str
    category_id: str | None = Field(None, alias="categoryId")
    recurrence_rule: str = Field(..., alias="recurrenceRule")
```

### Conventions
- **Dates:** ISO 8601 strings (`"2026-04-30"`). No JavaScript `Date` objects in API JSON.
- **Enums:** String enums (`"todo" | "in_progress" | "done"`). Not integers.
- **Soft deletes:** Backend filters out `deleted_at IS NOT NULL` rows by default.
- **Recurrence rules:** JSON strings, parsed on both sides.
- **TypeScript types:** Manually kept aligned with Pydantic schemas (~6 models, small enough to manage manually).

---

## 11. Folder Structure

```
taskspulse-mobile/
├── backend/
│   ├── main.py                          ← App factory, CORS, router registration
│   ├── database.py                      ← Engine, SessionLocal, Base
│   ├── requirements.txt
│   ├── taskspulse.db                    ← SQLite database file (gitignored)
│   ├── migrations/                      ← Numbered .sql migration files
│   │   ├── 001_add_categories.sql
│   │   ├── 002_add_habits.sql
│   │   └── ...
│   └── modules/
│       ├── __init__.py
│       ├── tasks/
│       │   ├── __init__.py
│       │   ├── router.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── models.py
│       ├── habits/
│       │   ├── __init__.py
│       │   ├── router.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── models.py
│       ├── goals/
│       │   ├── __init__.py
│       │   ├── router.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── models.py
│       ├── categories/
│       │   ├── __init__.py
│       │   ├── router.py
│       │   ├── schemas.py
│       │   ├── service.py
│       │   └── models.py
│       ├── cockpit/
│       │   ├── __init__.py
│       │   ├── router.py
│       │   ├── schemas.py
│       │   └── service.py
│       ├── analytics/                   ← Phase 4
│       └── planning/                    ← Phase 5
│
├── frontend/
│   ├── App.tsx                          ← NavigationContainer + TabNavigator
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json                    ← TypeScript config (new)
│   ├── babel.config.js
│   ├── index.js
│   └── src/
│       ├── types/                       ← Shared TypeScript interfaces
│       │   ├── index.ts
│       │   ├── habit.ts
│       │   ├── task.ts
│       │   ├── goal.ts
│       │   ├── category.ts
│       │   └── cockpit.ts
│       ├── theme/
│       │   └── theme.ts                 ← Colors, spacing, typography
│       ├── services/
│       │   └── apiClient.ts             ← Base fetch wrapper (TS version of api.js)
│       ├── components/                  ← Shared/reusable UI components
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Badge.tsx
│       │       ├── TextInput.tsx
│       │       ├── Modal.tsx
│       │       ├── EmptyState.tsx
│       │       ├── LoadingSpinner.tsx
│       │       ├── ProgressBar.tsx
│       │       ├── ConfirmDialog.tsx
│       │       └── SafeAreaWrapper.tsx
│       ├── navigation/
│       │   └── RootNavigator.tsx        ← Bottom tabs + stacks
│       └── features/                    ← Feature-based modules
│           ├── cockpit/
│           │   ├── screens/
│           │   │   └── DailyCockpitScreen.tsx
│           │   ├── components/
│           │   │   ├── CockpitHeader.tsx
│           │   │   ├── HabitSection.tsx
│           │   │   ├── TaskSection.tsx
│           │   │   └── StreakNudge.tsx
│           │   ├── hooks/
│           │   │   └── useCockpit.ts
│           │   └── api/
│           │       └── cockpitApi.ts
│           ├── habits/
│           │   ├── screens/
│           │   │   └── HabitsListScreen.tsx
│           │   ├── components/
│           │   │   ├── HabitRow.tsx
│           │   │   ├── HabitFormModal.tsx
│           │   │   └── StreakBadge.tsx
│           │   ├── hooks/
│           │   │   ├── useHabits.ts
│           │   │   └── useHabitStreak.ts
│           │   └── api/
│           │       └── habitsApi.ts
│           ├── tasks/
│           │   ├── screens/
│           │   │   ├── TaskListScreen.tsx
│           │   │   └── TaskDetailScreen.tsx
│           │   ├── components/
│           │   │   ├── TaskRow.tsx
│           │   │   ├── TaskFormModal.tsx
│           │   │   └── TaskStatusBadge.tsx
│           │   ├── hooks/
│           │   │   └── useTasks.ts
│           │   └── api/
│           │       └── tasksApi.ts
│           ├── goals/
│           │   ├── screens/
│           │   │   ├── GoalsListScreen.tsx
│           │   │   └── GoalDetailScreen.tsx
│           │   ├── components/
│           │   │   ├── GoalCard.tsx
│           │   │   ├── GoalFormModal.tsx
│           │   │   └── GoalProgressBar.tsx
│           │   ├── hooks/
│           │   │   └── useGoals.ts
│           │   └── api/
│           │       └── goalsApi.ts
│           ├── categories/
│           │   ├── screens/
│           │   │   └── CategoriesScreen.tsx
│           │   ├── components/
│           │   │   ├── CategoryChip.tsx
│           │   │   └── CategoryFormModal.tsx
│           │   ├── hooks/
│           │   │   └── useCategories.ts
│           │   └── api/
│           │       └── categoriesApi.ts
│           ├── backlog/
│           │   ├── screens/
│           │   │   └── BacklogScreen.tsx
│           │   └── hooks/
│           │       └── useBacklog.ts
│           ├── calendar/
│           │   ├── screens/
│           │   │   ├── MonthlyCalendarScreen.tsx
│           │   │   └── DateDetailScreen.tsx
│           │   ├── components/
│           │   │   ├── CalendarGrid.tsx
│           │   │   ├── CalendarDayCell.tsx
│           │   │   └── CalendarHeatmap.tsx
│           │   └── hooks/
│           │       └── useCalendar.ts
│           ├── analytics/
│           │   └── screens/
│           │       └── AnalyticsScreen.tsx
│           └── planning/
│               └── screens/
│                   └── WeeklyPlanningScreen.tsx
│
├── docs/
│   ├── frontend-rules.md
│   ├── backend-rules.md
│   └── architecture-plan.md          ← This file
│
├── BUSINESS_IDEAS_FROM_REPOSITORY.md
├── AGENTS.md
├── README.md
└── opencode.json
```

---

## 12. Phased Roadmap

### Phase 1: Foundation + Daily Cockpit + Habits (Week 1-2)

**Goal:** Replace the single-screen task list with tabbed navigation showing a Daily Cockpit with habits and tasks.

**Backend:**
- [ ] Refactor `main.py` into modular structure (`modules/tasks/`, `modules/categories/`, `modules/habits/`, `modules/cockpit/`)
- [ ] Add `categories` table + full CRUD endpoints
- [ ] Add `habits`, `habit_logs`, `habit_streaks` tables + CRUD + complete/undo endpoints
- [ ] Extend `tasks` table with: `status`, `priority`, `due_date`, `category_id`, `deleted_at`
- [ ] Add `/cockpit` endpoint (today's habits + today's tasks aggregated + global streak)
- [ ] Add query filters to `/tasks`: `?date=`, `?status=`, `?category_id=`
- [ ] Generate UUIDs for primary keys (use `uuid` module or hex randomblob)

**Frontend:**
- [ ] Set up TypeScript (`tsconfig.json`, rename files to `.tsx`)
- [ ] Install React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`)
- [ ] Install React Query (`@tanstack/react-query`)
- [ ] Create `src/theme/theme.ts` with design tokens
- [ ] Create shared UI components (`Button`, `Card`, `Badge`, `EmptyState`, `LoadingSpinner`, `Modal`)
- [ ] Create `src/services/apiClient.ts` (TS rewrite of `frontend/src/services/api.js`)
- [ ] Create TypeScript types in `src/types/`
- [ ] Build `DailyCockpitScreen` with `HabitSection` and `TaskSection`
- [ ] Build `HabitsListScreen` with create/edit `HabitFormModal`
- [ ] Build `CategoriesScreen` with create/edit `CategoryFormModal`
- [ ] Wire up React Query hooks for habits, tasks, categories
- [ ] Replace `App.js` with `App.tsx` and `RootNavigator`

### Phase 2: Goals + Task Linking (Week 3)

**Goal:** Users create goals, link tasks to goals, see progress bars.

**Backend:**
- [ ] Add `goals` and `goal_task_links` tables + CRUD endpoints
- [ ] Goal progress auto-computed from linked task completion ratio
- [ ] Add `?goal_id=` filter to `/tasks`
- [ ] `POST /goals/{id}/tasks` and `DELETE /goals/{id}/tasks/{task_id}` endpoints

**Frontend:**
- [ ] `GoalsListScreen` with create/edit `GoalFormModal`
- [ ] `GoalDetailScreen` showing linked tasks + progress bar
- [ ] `GoalCard` component with progress indicator
- [ ] `GoalProgressBar` component
- [ ] Link/unlink task from goal in `TaskFormModal`

### Phase 3: Streaks + Recurrence + Backlog (Week 4-5)

**Goal:** Proper habit streaks, recurring tasks, backlog for unscheduled tasks.

**Backend:**
- [ ] Streak calculation logic in `habits/service.py` (consecutive day counting, longest streak)
- [ ] Streak protection computation (which habits are "at risk" today)
- [ ] Add `recurrence_rule` column to tasks
- [ ] Recurrence expansion endpoint or query param
- [ ] `GET /habits/{id}/streak` endpoint

**Frontend:**
- [ ] `StreakBadge` component (streak count display)
- [ ] Streak protection nudge in `DailyCockpitScreen`
- [ ] Recurrence picker UI in `TaskFormModal` and `HabitFormModal`
- [ ] `BacklogScreen` — tasks with no `due_date`, search, goal filter
- [ ] Schedule action in backlog (set `due_date` on task)

### Phase 4: Calendar Views + Analytics (Week 6-7)

**Goal:** Monthly calendar grid with tasks, basic analytics dashboard.

**Backend:**
- [ ] `GET /tasks?month=` — tasks organized by date
- [ ] `GET /analytics/summary` — habit completion rate, streaks, goal progress, trends
- [ ] Calendar heatmap data: `GET /analytics/heatmap?months=`

**Frontend:**
- [ ] `MonthlyCalendarScreen` with `CalendarGrid` component
- [ ] `CalendarDayCell` showing task count dots
- [ ] `DateDetailScreen` — tapping a date shows its tasks
- [ ] `CalendarHeatmap` — color-coded density visualization
- [ ] `AnalyticsScreen` — habit completion rate, top streaks, goal progress, task trends

### Phase 5: Weekly Planning + Polish (Week 8+)

**Goal:** Weekly planning cockpit, UI polish.

**Backend:**
- [ ] `GET /planning/week?date=` — week capacity view
- [ ] `POST /planning/auto-balance` — redistribute overloaded days
- [ ] `GET /planning/focus-queue` — prioritized task queue
- [ ] `POST /planning/carry-forward` — move overdue to this week

**Frontend:**
- [ ] `WeeklyPlanningScreen` with day columns, capacity bars
- [ ] Auto-balance button, focus queue list, carry-forward
- [ ] Polish: loading skeletons, pull-to-refresh, error state improvements
- [ ] Settings screen

---

## 13. First Vertical Slice: Daily Cockpit with Habits

**This is what gets built immediately after this plan is approved.**

### Slice Scope
Delivers the app's #1 value proposition — a daily cockpit where the user sees and completes today's habits and tasks.

### Backend Build Order

#### Step 1: Create `modules/categories/`
```python
# models.py — Category ORM (id, name, color, icon, applies_to, created_at)
# schemas.py — CategoryCreate, CategoryUpdate, CategoryOut
# service.py — get_all, create, update, delete
# router.py — GET/POST/PUT/DELETE /categories
```

#### Step 2: Extend `modules/tasks/`
```python
# models.py — Add status, priority, due_date, category_id, deleted_at to Task
# schemas.py — Add new fields to TaskCreate, TaskUpdate, TaskOut
# service.py — Add soft-delete, status filtering, date filtering
# router.py — Add query params ?date=, ?status=, ?category_id=
```

#### Step 3: Create `modules/habits/`
```python
# models.py — Habit, HabitLog, HabitStreak ORMs
# schemas.py — HabitCreate, HabitUpdate, HabitOut, HabitLogOut, HabitStreakOut
# service.py — CRUD, complete_habit(), undo_completion(), calculate_streak()
# router.py — GET/POST/PUT/DELETE /habits, POST /habits/{id}/complete, DELETE /habits/{id}/complete
```

#### Step 4: Create `modules/cockpit/`
```python
# schemas.py — DailyCockpitOut { date, habits: [...], tasks: [...], global_streak: {...} }
# service.py — Aggregate today's habits + today's tasks in one query
# router.py — GET /cockpit
```

#### Step 5: Register all routers in `main.py`

### Frontend Build Order

#### Step 1: Infrastructure Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
   npm install react-native-screens react-native-safe-area-context
   npm install @tanstack/react-query
   npm install --save-dev typescript @types/react @types/react-native
   ```
2. Create `tsconfig.json`
3. Create `src/types/` with `task.ts`, `habit.ts`, `category.ts`, `cockpit.ts`
4. Create `src/theme/theme.ts`
5. Create `src/services/apiClient.ts` (migrate from `api.js`)
6. Create `src/components/ui/` shared components

#### Step 2: Feature APIs
1. `src/features/habits/api/habitsApi.ts`
2. `src/features/tasks/api/tasksApi.ts`
3. `src/features/categories/api/categoriesApi.ts`
4. `src/features/cockpit/api/cockpitApi.ts`

#### Step 3: React Query Hooks
1. `src/features/habits/hooks/useHabits.ts` — `useQuery` GET /habits, `useMutation` POST/PUT/DELETE
2. `src/features/tasks/hooks/useTasks.ts`
3. `src/features/categories/hooks/useCategories.ts`
4. `src/features/cockpit/hooks/useCockpit.ts` — `useQuery` GET /cockpit

#### Step 4: Screens
1. `DailyCockpitScreen.tsx` — renders HabitSection + TaskSection
2. `HabitsListScreen.tsx` — FlatList of HabitRow, FAB to create, modal for create/edit
3. `CategoriesScreen.tsx` — list of CategoryChip, create/edit modal

#### Step 5: Navigation
1. `RootNavigator.tsx` — BottomTabNavigator with Today and More tabs
2. `App.tsx` — QueryClientProvider + NavigationContainer + RootNavigator

### Done Criteria for First Slice
- [ ] User opens app → sees Daily Cockpit with "Today's Habits" and "Today's Tasks" sections
- [ ] User creates a habit via modal → appears on Cockpit
- [ ] User taps habit → checkmark appears, streak increments
- [ ] User taps again → unchecked, streak recalculates
- [ ] User creates a category "Health" → assigns to habit
- [ ] All data persists across app restarts (SQLite via API)
- [ ] App handles loading, empty, and error states gracefully
- [ ] All new endpoints visible in FastAPI Swagger (`/docs`)
- [ ] Existing `HomeScreen.js` replaced by new navigation structure

---

## 14. What to Delay

| Feature | Phase | Reason |
|---------|-------|--------|
| Google Calendar Integration | 6+ | Requires OAuth verification (blocking process) |
| AI Command Bar / AI Planning | 6+ | Requires OpenAI integration; core features must work first |
| Authentication (Google OAuth) | 6+ | Single-user MVP doesn't need it |
| Stripe Billing | 6+ | No subscription tiers to enforce yet |
| Push Notifications | 6+ | Requires Expo Notifications + server infrastructure |
| Offline-first / Local storage | Post-MVP | Complex; server-backed with loading is sufficient for MVP |
| Team workspaces | Post-MVP | Fundamentally changes data model |
| Data Export (CSV/PDF) | Post-MVP | Nice-to-have, not core to daily use |
| Admin Dashboard | Post-MVP | No users to administer |
| Weekly Planning Cockpit | Phase 5 | Valuable but complex; after core features stabilize |
| Recurrence Engine (full) | Phase 3 | Basic recurrence in Phase 1; full expansion logic in Phase 3 |

---

## 15. Risks and Tradeoffs

### Risks

| Risk | Mitigation |
|------|-----------|
| **SQLite single-writer bottleneck** | Standard SQL queries only; migration to Postgres = connection string change |
| **No offline support** | Acceptable for MVP (local server). Future: React Query `persistQueryClient` with AsyncStorage |
| **TypeScript migration friction** | Incremental: new files only. `HomeScreen.js` rewritten not migrated |
| **Navigation complexity** | Keep tree shallow: Tab → Stack → Screen. No nested stacks within stacks |
| **No auth = no user isolation** | MVP is local-only. Auth added before any public deployment |
| **N+1 query in Cockpit** | `cockpit/service.py` uses single optimized query with joins |

### Tradeoffs

| Tradeoff | Why |
|----------|-----|
| **SQLite over PostgreSQL** | Zero setup, single-file DB. Easy to switch later |
| **No ORM repository pattern** | Service layer calls SQLAlchemy directly. ≤10 models doesn't justify abstraction |
| **Bottom tabs over drawer** | Tabs more discoverable on mobile; maps to user mental model |
| **React Query over Redux/Zustand** | App is fundamentally a view on server state. React Query is purpose-built |
| **Manual TS types over code generation** | ~6 models. Manual alignment takes minutes per change |
| **Feature-based over layer-based folders** | Work on one feature in isolation without touching other folders |
| **Pydantic alias for camelCase** | Simple, explicit, per-model. Avoids global transformation middleware |

---

## 16. Dependencies to Install

### Backend (add to `requirements.txt`)
```
fastapi
uvicorn[standard]
sqlalchemy
```
Already installed — no additions needed for Phase 1.

### Frontend (new installs)
```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Server state
npm install @tanstack/react-query

# Dev
npm install --save-dev typescript @types/react @types/react-native
```

---

## 17. Done Criteria (Architecture Phase)

- [ ] This document reviewed and agreed upon
- [ ] First vertical slice (Daily Cockpit with Habits) implemented end-to-end
- [ ] Backend has 4 working modules: `tasks`, `categories`, `habits`, `cockpit`
- [ ] Frontend has TypeScript, React Navigation, React Query, tabbed navigation
- [ ] `DailyCockpitScreen` renders today's habits and tasks from the API
- [ ] Habit can be created, completed, and uncompleted via the mobile UI
- [ ] All new API endpoints appear in FastAPI Swagger (`/docs`)
- [ ] `HomeScreen.js` replaced by new navigation structure
- [ ] Folder structure matches this plan
- [ ] `uvicorn main:app --reload` (backend) and `npx expo start` (frontend) run without errors
