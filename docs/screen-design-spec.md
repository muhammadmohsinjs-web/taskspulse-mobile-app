# TasksPulse — Complete Screen Design Specification

## Design System Reference (Established Tokens)

- **Primary accent:** `#4A90D9` (blue)
- **Background:** `#F5F7FA` (light gray)
- **Cards:** `#FFFFFF` with 8px radius, subtle shadow (elevation 2)
- **Text hierarchy:** `#1A1A2E` (primary), `#6B7280` (secondary), `#9CA3AF` (muted)
- **Semantic:** Danger `#EF4444`, Success `#10B981`, Warning `#F59E0B`
- **Palette for selection:** `["#4A90D9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"]`
- **Spacing scale:** xs=4, sm=8, md=12, lg=16, xl=20, xxl=24, xxxl=32
- **Font scale:** xs=12, sm=14, md=16, lg=18, xl=20, xxl=24, heading=28
- **Shared components:** Button (4 variants), Card, Badge, Modal, EmptyState, LoadingSpinner, ProgressBar, FAB (56px circle), CategoryChip, StreakBadge, HabitRow, TaskRow, GoalCard, TaskFormModal

---

## Navigation Structure Redesign

**Current state:** Two bottom tabs (☀️ Today, ⋯ More) with deep nested stacks. This hides Calendar, Goals, and Backlog inside "More," making them feel secondary.

**Recommended redesign:** Five bottom tabs, each with its own stack:

| Tab      | Icon | Label    | Stack screens                                                               |
| -------- | ---- | -------- | --------------------------------------------------------------------------- |
| Today    | ☀️   | Today    | DailyCockpit, TaskDetail, TaskFormModal                                     |
| Calendar | 📅   | Calendar | MonthlyCalendar, DateDetail                                                 |
| Backlog  | 📥   | Backlog  | BacklogScreen, TaskFormModal                                                |
| Goals    | 🎯   | Goals    | GoalsList, GoalDetail, GoalFormModal, GoalTaskLinkModal                     |
| More     | ⚙️   | More     | HabitsList, HabitFormModal, Categories, Analytics, Settings, WeeklyPlanning |

Each tab icon uses a focused/unfocused state: full color at 100% opacity when active, muted/50% opacity when inactive. The More tab acts as a "settings and advanced" hub for power users. The primary creation flow (FAB) remains on the Today tab only.

---

## Exact Screen Count: 18

1. **OnboardingScreen** — First-time welcome, quick setup wizard
2. **DailyCockpitScreen** — Today's habits + tasks, streak card, evening nudge
3. **TaskDetailScreen** — Full task details, edit entry point, goal linking
4. **TaskFormModal** — Create/edit task (title, description, due date, priority, category, recurrence, goal link)
5. **MonthlyCalendarScreen** — Month grid with task density heatmap
6. **DateDetailScreen** — Tap a date to see its tasks
7. **BacklogScreen** — Unscheduled tasks, search bar, schedule-to-date action
8. **GoalsListScreen** — Smart-grouped goal list with progress bars, filters
9. **GoalDetailScreen** — Single goal with linked tasks, progress, edit entry
10. **GoalFormModal** — Create/edit goal with title, target, deadline, color
11. **GoalTaskLinkModal** — Pick existing tasks to link to a goal
12. **HabitsListScreen** — All habits with streak info, toggle, categories
13. **HabitFormModal** — Create/edit habit with name, description, category, color, recurrence
14. **CategoriesScreen** — Category list with color badges, edit/delete, scope toggle
15. **AnalyticsScreen** — Charts, stats, trends for habits/tasks/goals
16. **SettingsScreen** — App preferences (notifications, theme, data)
17. **WeeklyPlanningScreen** — Week-over-week capacity view, auto-balance, carry-forward
18. **OnboardingScreen (refined)** — Polished version with gradient + curtain-reveal transition

---

## Screen-by-Screen Design

---

### 1. OnboardingScreen

**Purpose:** Greet first-time users, explain the app's three core value propositions (habits, planning, goals), and optionally collect a personality preference to pre-populate sample data. This screen replaces the blank "empty state" experience and sets user expectations.

**Screen Structure**

The OnboardingScreen is a three-step horizontal swipeable carousel, rendered full-screen with the system status bar hidden behind a dark overlay. Each step occupies the full viewport height and is visible one at a time with a parallax transition between steps. A centered illustration area occupies the top 40% of the screen on each page. Below the illustration, a short headline in the heading font size plus a supporting sentence in sm secondary text sits centered with lg horizontal padding. At the bottom, a row of three progress dots sits above a single wide primary button labeled with the next step's action. A small "Skip" ghost button appears in the top-right corner with xl top padding. The final step replaces the primary button with a "Get Started" call to action, and the skip button disappears.

The three steps are:

- **Step 1:** "Build habits that stick" — illustration of a growing streak flame, explaining daily habit tracking
- **Step 2:** "Plan your days, not just your tasks" — calendar-plus-task illustration, explaining the cockpit view
- **Step 3:** "Reach your goals" — progress bar illustration, explaining goal linking

**Visual Hierarchy**

The headline is the dominant element on each step — large, bold, dark. The supporting body text is intentionally de-emphasized with muted color. The primary button steals visual attention at the bottom through its solid blue fill against the light gray background. The progress dots are subtle, using the primary color for the active dot and the border color for inactive ones. The skip link reads as secondary text, deliberately understated.

**Component Arrangement**

- Top-right: Ghost "Skip" button (sm font, primary color text)
- Center area: Emoji illustration placeholder (64px text), headline (heading/bold/dark), subtitle (sm/muted)
- Bottom center: Row of three dots (8px, rounded-full), then a full-width primary Button with lg horizontal inset

**Interactions**

- Swiping left/right moves between steps with a smooth spring animation
- Tapping a dot jumps directly to that step
- Tapping "Skip" immediately navigates to the DailyCockpitScreen, replacing the navigation stack
- The "Get Started" button on step 3 triggers a brief success animation (the button pulses green with a checkmark) before navigating to the cockpit
- No back navigation is possible from the cockpit after onboarding — this is a replacement navigation

**States**

- **Loading state:** Entire screen shows the LoadingSpinner with message "Setting things up..."
- **Normal state:** The three-step carousel as described
- **Empty/Error:** Not applicable (this is a static experience, no data loading)
- **Success state:** The button pulse animation on step 3 before transition
- **Edge case:** If the user force-closes during onboarding, they resume at step 1 on next launch; there is no partial-progress persistence

**Creative Idea — Personality Picker Instead of Generic Steps**

Replace the generic illustration steps with a lightweight "personality quiz." The first screen asks: "What brings you to TasksPulse?" with three cards: "I want to build habits," "I need to organize my tasks," "I'm working toward a big goal." Each card has a colorful icon. The user's choice determines what content is pre-populated (a sample habit, a sample task, or a sample goal) after onboarding. This makes the empty state after onboarding feel personal and immediately useful rather than blank. The choice also subtly configures the default tab order priority.

---

### 2. DailyCockpitScreen

**Purpose:** Serve as the home screen — the "daily command center." Users land here every time they open the app. It provides an at-a-glance view of today's habits (with streak data) and tasks (with priority indicators), a global progress card showing overall habit completion, an evening nudge warning for at-risk streaks past 5 PM, and quick access to create new tasks via the FAB.

**Screen Structure**

The cockpit is the home screen of the app. The screen has no native navigation header — the header area is custom-built inline. At the very top, with xxxl top padding and lg horizontal padding, a large bold heading reads "Today" with the full date below it in sm secondary text (e.g., "Wednesday, April 29, 2026"). Immediately below, if the user has any habits, a Global Streak Card spans the full width with lg horizontal margins. This card contains three stacked elements: a row with "Daily Progress" on the left and habit count stats on the right; a centered StreakBadge displaying the fire emoji with the current streak count and best streak; and a ProgressBar showing overall habit completion for the day, colored green if the streak is active or blue if not yet started.

Below the streak card, if it is past 5 PM and any habits with a current streak of 3 or more days remain uncompleted, a yellow-toned "Evening Nudge" warning strip appears. This strip uses a soft amber background (`#FEF3C7`), has a bolt emoji on the left, and reads something like "2 habits at risk! Complete before the day ends." in a dark amber text color.

The main content is divided into two sections, stacked vertically inside a ScrollView:

**Habits Section:** A section header row with "Habits" on the left (lg, bold) and a blue "Manage" link on the right. Below it, each habit is rendered as a HabitRow component — a white card with a checkbox on the left, habit title and optional description in the middle, and a streak count with fire emoji on the right. Completed habits show the checkbox filled green and the title with a strikethrough in muted text.

**Tasks Section:** Identical section header pattern with "Tasks" on the left and "View All" link on the right. Each task is shown as a compact row (white card, horizontal layout): a circular toggle icon on the left (empty circle for todo, green checkmark for done), the task title in the middle (md font, dark), and a small priority dot on the right (8px circle: red for urgent, amber for high, muted gray for medium/low). Only tasks due today or overdue appear here.

**Bottom area:** The FAB floats at the bottom-right (56px, primary blue, "+" icon, elevation 6). Tapping it opens the TaskFormModal in create mode. The FAB is positioned absolute, always visible over the scroll content. The list content has bottom padding of 100px to ensure the last item scrolls above the FAB.

**Visual Hierarchy**

The Global Streak Card commands attention first — it's the most visually rich element: a white elevated card with a large fire emoji, big number, progress bar, and shadow. The Today heading is large but static, serving as a page anchor rather than a call to action. Habits get slightly more visual weight than tasks because each HabitRow includes a color from the habit's own palette and a streak count, whereas TaskRows are more monochrome with just a small colored priority dot. The evening nudge strip, when present, uses color contrast (amber on light gray) to draw immediate attention without being alarming.

**Component Arrangement**

- Custom header: heading text + date
- StreakCard: Info row → StreakBadge centered → ProgressBar full-width
- Nudge strip: Icon + warning text (conditionally rendered)
- Section header: Title (left) + "Manage"/"View All" link (right)
- HabitRows: Checkbox | Title + description | Streak count + fire
- TaskRows: Checkbox | Title | Priority dot
- FAB: Absolute, bottom-right

**Interactions**

- Tapping a HabitRow toggles its completion state instantly with optimistic UI — the checkbox fills green and the text strikes through immediately
- Tapping a TaskRow toggles between done/todo with similar instant feedback
- Long-pressing a HabitRow triggers a deletion confirmation alert
- Long-pressing a TaskRow navigates to TaskDetailScreen
- Tapping "Manage" navigates to HabitsListScreen
- Tapping "View All" navigates to TaskListScreen
- Tapping the FAB opens TaskFormModal in create mode with today's date pre-selected
- Pull-to-refresh reloads all cockpit data from the API
- A short haptic buzz fires on successful habit/task toggle

**States**

- **Loading state:** Full-screen LoadingSpinner with "Loading today's plan..."
- **Empty state (no data at all):** The cockpit shows the Today header and date. Below the streak area (hidden since no habits), both sections show EmptyState components: "No habits yet" with 🌱 icon and "Create your first habit to start building streaks" subtitle; "No tasks for today" with 📝 icon and "Add a task to get started" subtitle. The FAB is still visible.
- **Empty state (habits exist but none today):** The Habits section shows "No habits for today" with a 🌱 icon, but the "Manage" link is still visible
- **Normal state:** Populated habits and tasks, streak card, progress bar
- **Error state:** The error is shown inline rather than full-screen. The data area shows an EmptyState with ⚠️ icon, "Couldn't load cockpit," and "Pull down to retry" subtitle. The header and FAB remain visible so the user can still create items.
- **Success state:** After toggling a habit/task, the row animates smoothly. Completed habits show the green checkbox with a brief scale-up micro-animation. If it's the last habit needed to complete all daily habits, the streak badge briefly pulses gold.
- **Edge case — very long list:** The ScrollView handles up to 30+ items smoothly. Only the first 3 habits and first 5 tasks are shown by default if the list exceeds 8 items, with a "Show all N items" expander at the bottom of each section.

**Creative Idea — "Momentum Pulse"**

At the top of the screen, between the date and the streak card, add a subtle "momentum pulse" — a thin horizontal line that fills from left to right as the user completes their habits throughout the day. When the bar reaches 100% (all daily habits done), it briefly glows with the success color and then collapses. This gives a physical sense of progress that lives outside the streak card — it's always visible as you scroll. On days where habits were completed early, the bar is full from the start, giving a satisfying "you're done" signal before the user even reads their list.

---

### 3. TaskDetailScreen

**Purpose:** Display complete information about a single task. Users arrive here by tapping a task row anywhere in the app. This screen provides read-only viewing of all task metadata, editing capabilities, status toggling, goal linking, and schedule management in a single scrollable view.

**Screen Structure**

The TaskDetailScreen is a full-screen view reached by tapping a TaskRow. The native header shows a back arrow and the word "Task" as the title, with a context menu (three-dot icon) in the top-right that reveals Edit and Delete options. Below the header, the screen is a ScrollView with lg horizontal padding throughout.

At the top, a large Task Title is displayed in xxl bold dark text, occupying the full width. Below the title, in a single horizontal row, a set of metadata badges describe the task's current state: a pill Badge for priority (colored accordingly — red/amber/blue/muted), a text chip for status (todo/in_progress/done), a category chip if assigned, and a due date if set. These wrap onto a second row if needed.

Below the metadata row, a subtle horizontal divider (1px, border color) separates the header area from the body. The description — if present — follows in md secondary text with comfortable line height. If no description exists, a muted "No description" placeholder appears.

A "Progress & Linking" card follows, containing:

- A status toggle row with three touchable pills (To Do, In Progress, Done) — the current status is filled primary blue
- If linked to a goal, a linked goal preview card within this section showing the goal name, its progress bar, and a "View Goal" link
- If not linked, a "Link to Goal" button (secondary variant) that opens the GoalTaskLinkModal

Below, a "Schedule" card shows:

- The current due date displayed prominently with a calendar emoji
- A "Change Date" button that triggers the native date picker
- A "Move to Backlog" button (ghost variant with muted text) that clears the due date

At the bottom, a sticky action bar contains a row of buttons: a danger "Delete" ghost button on the left, a secondary "Edit" button in the middle, and a primary status-toggle button on the right ("Mark Done"/"Reopen").

**Visual Hierarchy**

The task title is the hero element — large, bold, unmistakable. The metadata row gives an at-a-glance summary. The description is intentionally de-emphasized (secondary color) since it's reference material. The "Progress & Linking" card sits at the same visual level as the "Schedule" card — equal-weight white cards. The sticky action bar at the bottom is the most prominent interactive element, using the full primary color for the main status action.

**Component Arrangement**

- Header: Back arrow | "Task" title | Context menu (⋯)
- Hero area: Title (xxl/bold) → Metadata pill row → Divider → Description
- Progress card: Status toggle pills → Linked goal preview (if any) → Link button (if none)
- Schedule card: Due date display → Change Date button → Move to Backlog button
- Sticky bottom bar: Delete (ghost/left) | Edit (secondary/center) | Toggle status (primary/right)

**Interactions**

- Tapping the context menu (⋯) reveals Edit and Delete options in a bottom sheet
- Tapping "Edit" slides up the TaskFormModal pre-filled with the task data
- Tapping "Delete" shows a confirmation alert; on confirm, the task is soft-deleted and the screen pops back
- Tapping a status pill instantly updates the task status with optimistic UI
- Tapping "Link to Goal" opens the GoalTaskLinkModal
- Tapping "View Goal" navigates to GoalDetailScreen
- Tapping "Change Date" opens the native date picker
- Tapping "Move to Backlog" clears the due date and optionally navigates back

**States**

- **Loading state:** The screen briefly shows a LoadingSpinner while fetching full task data
- **Error state:** If the task is not found (deleted or bad ID), shows EmptyState with ⚠️ "Task not found" and a "Go Back" button
- **Normal state:** Full task detail as described
- **Success state:** After editing, a subtle "Saved" toast appears at the top. After toggling status, the status pill updates with a brief color transition.
- **Edge case — very long title:** Title wraps to multiple lines, capped at 3 lines maximum
- **Edge case — very long description:** Description scrolls naturally within the ScrollView

**Creative Idea — "Quick Note" Swipe-In**

Instead of requiring the user to tap Edit to add a description, allow a subtle interaction: when the user swipes right on the description area (even if empty), a quick inline text input slides in from the right edge where they can type a one-line note and hit "Save" — all without opening a modal. This reduces friction for the most common edit: adding context to a task you just created with only a title.

---

### 4. TaskFormModal

**Purpose:** The single unified form for creating and editing tasks. Accessed from the cockpit FAB, backlog FAB, calendar FAB, or by tapping "Edit" on a task detail screen. Contains all task configuration fields in a structured, scannable vertical form.

**Note:** This screen already exists as a well-designed modal. The design spec below validates and extends the existing implementation.

**Screen Structure**

The TaskFormModal is presented as a centered Modal (overlay + white sheet, 80% max height, rounded-lg corners). The header row spans the full width: the title "New Task" or "Edit Task" on the left, an "✕" close button on the right. The body is a ScrollView containing labeled form fields stacked vertically with md spacing between field groups.

**Form fields in order:**

1. **Title** — required, single-line TextInput with placeholder "e.g. Review contract"
2. **Description** — optional, multiline TextInput (3 lines visible, scrollable) with placeholder "Add details..."
3. **Priority** — horizontal row of 4 option pills: Low, Medium, High, Urgent. The active pill is filled primary blue; inactive pills are outlined
4. **Status** — horizontal row of 3 option pills: To Do, In Progress, Done
5. **Due Date** — a touchable row styled like an input that, when tapped, reveals the native DateTimePicker below it. Shows the selected date or "Select a date" placeholder. An "✕" clear button appears when a date is selected
6. **Recurrence** — horizontal row of 3 option pills: One-off, Daily, Weekly
7. **Category** — horizontal row of category chips. Each chip uses the category's own color as its border and, when selected, fills with a 20%-opacity version of that color. A "None" pill appears first
8. **Goal** (conditionally visible, when `showGoalPicker` is true) — horizontal row of goal name pills, each bordered with the goal's color. A "None" pill appears first

The footer row contains "Cancel" (ghost button, left) and "Create Task" / "Save Changes" (primary button, right). The primary button shows an ActivityIndicator spinner when saving.

**Visual Hierarchy**

Labels are small (sm, bold, dark) — they guide but don't dominate. Input fields are the primary interactive elements, with clear borders and comfortable padding. Option pills create visual rhythm with their uniform size and wrapping rows. The primary save button anchors the bottom and draws the eye.

**Component Arrangement**

- Modal overlay → white sheet → header row → scrollable body → footer actions
- Each form group: Label → Input/Chip row
- Chip rows: flexWrap, gap sm, pill-shaped with full border-radius
- Date picker: embedded inline below the date touchable when active
- Actions: row, flex-end, gap sm

**Interactions**

- Tapping outside the modal (overlay) closes it without saving
- Tapping "✕" closes without saving
- The save button is disabled (shows spinner) during the API call to prevent double submission
- Selecting a priority/status/recurrence pill updates immediately with visual feedback
- Selecting a category chip toggles it on/off
- The due date picker appears inline (iOS spinner style) or as a native dialog (Android)
- Keyboard-aware: the modal body scrolls to keep the active input visible

**States**

- **Create mode:** Title is "New Task," all fields empty/default, save button says "Create Task"
- **Edit mode:** Title is "Edit Task," all fields pre-filled from existing task data, save button says "Save Changes"
- **Idle state:** All fields ready for input, save button active
- **Saving state:** Save button shows spinner, all inputs remain editable (to preserve input during slow saves), cancel is still available
- **Validation error:** If title is empty on save, a native Alert says "Please enter a task title"
- **API error:** Alert displays the error message; modal stays open so user data is preserved
- **Edge case — very long category names:** Category chips truncate at 15 characters with an ellipsis

**Creative Idea — Quick-Action Chip Gestures**

Instead of tapping into each pill group, allow the user to swipe horizontally across the priority chips to cycle through values. A subtle haptic click fires on each change. This feels like a physical dial — fast, satisfying, and reduces tap precision requirements. The same gesture works on the status and recurrence rows.

---

### 5. MonthlyCalendarScreen

**Purpose:** Provide a full-month overview of scheduled tasks. Users scan the grid to see which days are busy (task density dots), navigate between months, and tap any day to drill into its tasks. The screen also surfaces the FAB for quick task creation on a selected date.

**Screen Structure**

The MonthlyCalendarScreen is a dedicated Calendar tab screen. The top area shows the current month and year in a large bold title (e.g., "April 2026"), centered or left-aligned, flanked by left/right arrow buttons for month navigation. A "Today" pill button sits in the top-right corner to jump back to the current month.

Below the header, a weekday row displays the abbreviated day names: Sun Mon Tue Wed Thu Fri Sat, in xs muted text, evenly spaced across the screen width. Beneath, a 6-row × 7-column grid renders the month's days. Each day cell is a square (screen width ÷ 7 minus spacing). Inside each cell, the day number appears at the top (sm, semibold, dark for current month, muted for adjacent month days). Today's cell has a primary-blue filled circle behind the number. Below the number, a row of up to 3 colored dots represents the tasks on that day — one dot per task, color-coded by the task's category or priority. If more than 3 tasks exist on a day, a "+N" text appears instead of the fourth dot.

Below the calendar grid, a horizontal scrollable row shows the next 7 days as quick-select chips (day name + date abbreviated), with today highlighted in primary blue.

At the bottom of the screen, a summary card shows: "You have X tasks scheduled this month" and a mini bar chart showing task distribution across weeks. The FAB is present on this screen, opening the TaskFormModal with the currently selected date pre-filled.

**Visual Hierarchy**

The calendar grid is the dominant visual element — it fills the upper 55% of the screen. The current day's blue circle draws immediate attention. Days with many tasks feel visually "heavy" through dot density, creating an instant heatmap effect. The weekly quick-select strip is secondary but easily tappable. The monthly summary card is informational and de-emphasized.

**Component Arrangement**

- Month header: ← arrow | "April 2026" (xl/bold/centered) | → arrow | "Today" pill (top-right)
- Weekday labels: 7-column row, xs/muted
- Day grid: 6 rows × 7 columns, square cells, day number + dot row
- Week strip: horizontal ScrollView of 7 day chips
- Summary card: task count + week-distribution mini bars
- FAB: absolute, bottom-right

**Interactions**

- Tapping a day cell navigates to DateDetailScreen for that date
- Swiping horizontally on the grid changes the month (left = next month, right = previous month)
- Tapping "Today" jumps to the current month and highlights today
- Tapping a day chip in the week strip also navigates to DateDetailScreen
- Tapping the FAB opens TaskFormModal with the currently focused date pre-filled
- Long-pressing a day cell shows a tooltip with the exact task count and titles

**States**

- **Loading state:** The calendar grid shows placeholder squares with subtle shimmer animation; the summary card shows a shimmer skeleton
- **Empty state (no tasks in month):** The calendar grid renders normally with day numbers but no dots. The summary card says "No tasks scheduled this month" with a 📅 icon and "Tap a date to add tasks"
- **Normal state:** Populated grid with varying dot densities
- **Error state:** The grid still renders (dates are computed client-side), but the summary card shows "Couldn't load task data" with a retry button
- **Edge case — month with 6 rows:** Some months (like when the 1st falls on Saturday) need a 6th row; the grid dynamically adjusts cell height to fit
- **Edge case — very task-heavy day:** Shows "+N" overflow indicator with the exact count in a tooltip on long-press

**Creative Idea — "Unfilled Days" Gradient Warning**

Days that are in the past and had zero tasks completed get a subtle red-tinted background wash (very faint, 5% opacity). Days that had tasks and all were completed get a subtle green wash. This creates a color-field heatmap at a glance — the user can instantly see which weeks were productive (green) vs. which had gaps (red/pink). This is an ambient awareness feature that requires no interpretation — you feel it before you read it.

---

### 6. DateDetailScreen

**Purpose:** Show all tasks due on a specific date, grouped by status. Users arrive here by tapping a day in the calendar grid. Provides a focused view of one day's workload with quick toggling, task creation (FAB), and a summary card with completion stats.

**Screen Structure**

The DateDetailScreen is pushed onto the navigation stack when a user taps a day cell. The native header shows the formatted date as the title (e.g., "Wed, Apr 29, 2026") with a back arrow. A subtle subtitle below the header shows the relative date descriptor ("Today," "Tomorrow," "Yesterday," "3 days ago").

The primary content is a FlatList of tasks due on that date. Each task is rendered as a full TaskRow with checkbox, title, metadata (priority badge, category chip, status). Tasks are grouped by status: "To Do" first, then "In Progress," then "Done" — each group with a small section label in sm uppercase muted text.

If no tasks exist for the date, a large EmptyState appears: a calendar emoji with "No tasks for this day" and a subtitle "Tap + to add one." The FAB is present — tapping it opens TaskFormModal with the date pre-filled.

Above the task list, a "Day Summary" card shows quick stats: number of tasks, completed count, and a small progress ring.

**Visual Hierarchy**

The task list is the primary content — scannable rows with clear status grouping. The day summary card is compact and sits above the list as a quick-glance dashboard. The header date is prominent but functional.

**Component Arrangement**

- Header: Back arrow | Date title
- Sub-header: Relative date descriptor (sm, secondary)
- Day Summary Card: Stats (task count, completed, progress ring)
- Task list: Sectioned by status with section labels
- EmptyState: Centered when no tasks
- FAB: Bottom-right

**Interactions**

- Tapping a task navigates to TaskDetailScreen
- Tapping the task checkbox toggles completion inline
- Long-pressing a task triggers delete confirmation
- Pull-to-refresh reloads the day's tasks
- The progress ring in the summary card fills clockwise as tasks are completed

**States**

- **Loading state:** Skeleton rows (shimmer cards) matching TaskRow height
- **Empty state:** DateDetailEmpty with calendar emoji, "No tasks for this day," FAB visible
- **Normal state:** Tasks grouped by status, summary card populated
- **Error state:** EmptyState with ⚠️ "Couldn't load tasks" + pull-to-retry
- **Edge case — single task:** Looks clean; the grouping header is still shown

**Creative Idea — "Morning Brief" Voiceover Card**

At the top of the day detail, when the user views today's date in the morning (before 10 AM), show a special "Morning Brief" card that reads: "You have 3 tasks due today. Your highest priority is 'Submit proposal' (urgent). Let's make it a productive day ☀️." This is a generated one-sentence summary that contextualizes the task list — it makes the app feel like a thoughtful assistant rather than a database viewer.

---

### 7. BacklogScreen

**Purpose:** House all unscheduled tasks (those with no due date). This screen is the "inbox" for tasks — users capture ideas quickly here and schedule them later. It emphasizes search, filtering, and the "schedule" action as the primary call-to-action per task.

**Screen Structure**

The BacklogScreen is the dedicated home for unscheduled tasks (tasks with no due date). At the top, a prominent search bar (white card, rounded, magnifying glass emoji or icon, placeholder "Search backlog...") allows filtering by task title. Below the search bar, a horizontal chip row provides quick filters: All, To Do, In Progress, Done, High Priority Only.

The main content is a FlatList of backlog tasks. Each task is rendered as a TaskRow with an additional visible "Schedule" button on the right — a small calendar icon that, when tapped, opens a compact date picker bottom sheet to assign a due date. Tasks are sorted by creation date (newest first) or by priority (high first), controlled by a sort toggle in the top-right.

If the backlog is empty, a celebratory EmptyState appears: "Backlog is clear!" with a 🎉 icon and "All tasks are scheduled. Nice work."

The FAB is present — it opens TaskFormModal with no due date pre-filled (creating a new backlog task).

**Visual Hierarchy**

The search bar is the most prominent element at the top — it invites immediate filtering. The filter chips are secondary but always visible. Each TaskRow has equal visual weight, with the "Schedule" button being the most colorful element per row (primary blue calendar icon). The "Schedule" action is emphasized because scheduling is the primary purpose of this screen.

**Component Arrangement**

- Search bar: Full-width, white card, magnifying glass icon, placeholder text
- Filter row: Horizontal scrollable chips (All, To Do, In Progress, Done, High Priority)
- Sort toggle: Top-right, small text icon
- Task list: TaskRow + schedule button per item
- EmptyState: Centered, celebratory
- FAB: Bottom-right

**Interactions**

- Typing in the search bar filters tasks in real-time with a 300ms debounce
- Tapping a filter chip updates the list
- Tapping the calendar icon on a task opens a compact bottom sheet with a date picker and "Schedule" / "Cancel" buttons
- Swiping a task row left reveals a red "Delete" action (iOS-style swipe action)
- Swiping a task row right reveals a blue "Schedule for Today" quick action
- Tapping the task navigates to TaskDetailScreen
- Pull-to-refresh reloads the backlog

**States**

- **Loading state:** Shimmer cards in TaskRow shape with a shimmer search bar
- **Empty state (no backlog ever):** "No unscheduled tasks" with 📥 icon and "Tasks without a due date appear here"
- **Empty state (search no results):** "No tasks match your search" with 🔍 icon and "Try a different search term"
- **Normal state:** Populated list with search and filters
- **Error state:** EmptyState with ⚠️ and retry
- **Edge case — very long list:** FlatList handles it efficiently; the search bar sticks at the top (not part of FlatList)
- **Edge case — scheduling the only backlog task:** After scheduling, the list shows the empty state; a subtle "Task scheduled for [date]" toast appears at the top

**Creative Idea — "Weekend Sweep" Prompt**

If the user has more than 5 tasks in the backlog and it's Friday, show a friendly card at the top: "5 tasks are waiting in your backlog. Want to plan your week ahead?" with a "Plan My Week" button that opens the WeeklyPlanningScreen. This turns the backlog from a passive dumping ground into an active planning trigger.

---

### 8. GoalsListScreen

**Purpose:** Display all goals as scannable cards with progress bars. Users filter between active and completed goals, create new goals via FAB, and tap a goal to see its details and linked tasks. The primary interaction is progress monitoring at a glance.

**Note:** This screen's design extends the existing implementation with filters and visual enhancements.

**Screen Structure**

The GoalsListScreen has a clean layout with the native header reading "Goals." The FAB floats at bottom-right for creating new goals. The main content is a FlatList of GoalCards.

**Recommended enhancement:** Add a segmented filter at the top of the list (above the first goal): "All," "Active," "Completed." Active goals are those with progress < 100%. Completed goals (100% progress) are visually faded — lower opacity, muted status text. This prevents completed goals from cluttering the active view while still being accessible.

Each GoalCard displays:

- Title (md, semibold, dark)
- Task count (xs, secondary): "3/8 tasks"
- Description (sm, secondary, up to 2 lines)
- ProgressBar (colored with goal's custom color, 6px height)
- Percentage text to the right of the bar
- Target date (xs, muted, if set)

**Visual Hierarchy**

GoalCards are equal-weight white cards with shadows. The progress bar is the most dynamic element — it provides an instant visual gauge of goal completion. Active goals get full visual treatment; completed goals are visually subdued.

**Component Arrangement**

- Header: "Goals" title
- Filter segmented control: All | Active | Completed
- FlatList of GoalCards
- FAB: Bottom-right
- Create modal (GoalFormModal): inline modal with name, description, target date, color picker, action buttons

**Interactions**

- Tapping a GoalCard navigates to GoalDetailScreen
- Long-pressing triggers delete confirmation
- Tapping the FAB opens GoalFormModal in create mode
- Pull-to-refresh reloads goals

**States**

- **Loading state:** LoadingSpinner with "Loading goals..."
- **Empty state:** EmptyState with 🎯 "No goals yet" and "Tap + to create your first goal"
- **Normal state:** GoalCards in a list
- **Error state:** EmptyState with ⚠️ and "Pull down to retry"
- **Edge case — single goal:** One card centered in the list, FAB still visible for adding more

**Creative Idea — "Goal Streak" Celebration**

When a goal reaches 100% completion, the GoalCard briefly animates with a subtle confetti burst (small colored particles emanating from the progress bar). The card gets a golden border for 3 seconds before settling into the "Completed" faded state. This micro-celebration makes goal completion feel genuinely rewarding rather than just a number change.

---

### 9. GoalDetailScreen

**Purpose:** Show full details of a single goal — title, description, progress bar, linked tasks list, and controls to add/remove linked tasks. Users track progress here and link tasks to advance the goal. The screen transforms the abstract goal into a concrete, actionable plan.

**Screen Structure**

The native header shows "Goal" as the title with a back arrow. The screen content is a FlatList where the ListHeaderComponent is the goal detail card, followed by linked tasks.

The Goal Detail Card occupies the full width with lg padding and features a 4px colored left border in the goal's custom color. Inside the card:

- A header row with the goal title (xxl, bold, dark) and a "Delete" text button (danger color) on the right
- Description text below (md, secondary)
- A progress section with a label "Progress (X/Y tasks)" and a ProgressBar (8px height) in the goal's color
- Target date (xs, muted) if set

Below the card, a section header with "Linked Tasks" on the left and a "+ Add Task" secondary button on the right.

Linked tasks are rendered as TaskRows. Long-pressing a linked task shows an "Unlink" confirmation. Tapping toggles completion and updates the goal progress.

**Visual Hierarchy**

The goal card with its colored left border is the hero — it frames the entire goal. The progress bar is the most scannable indicator. Linked tasks are secondary content, each receiving standard TaskRow treatment.

**Component Arrangement**

- Header: Back arrow | "Goal" title
- Goal Card (FlatList header): Colored left border → title + delete → description → progress bar → target date
- Section header: "Linked Tasks" | "+ Add Task" button
- Task rows: Standard TaskRow pattern
- "Add Task" modal: TaskFormModal in create mode, with auto-linking to this goal

**Interactions**

- Tapping "+ Add Task" opens TaskFormModal; on save, the task is created and linked to this goal
- Tapping a task toggles its completion and updates goal progress
- Long-pressing a linked task shows unlink confirmation
- Tapping "Delete" shows confirmation that linked tasks will be unlinked
- Pull-to-refresh reloads goal and linked tasks

**States**

- **Loading state:** LoadingSpinner with "Loading goal..."
- **Error state (goal not found):** EmptyState with ⚠️ "Goal not found" and "It may have been deleted"
- **Empty linked tasks:** EmptyState with 📋 "No linked tasks" and "Tap Add Task to link a task to this goal"
- **Normal state:** Goal card + linked task list
- **Edge case — goal at 100%:** Progress bar is fully green; a subtle "Achieved!" badge appears next to the goal title

**Creative Idea — "Path to Goal" Milestone Timeline**

Instead of a flat task list below the goal card, display linked tasks grouped into a vertical "milestone timeline." Each task becomes a dot on a vertical line leading toward the goal target. Completed tasks get a green dot with a checkmark; pending tasks get an outlined circle. The target date sits at the end of the line as a flag icon. This transforms the task list into a visual journey — you can literally see how close you are to the goal.

---

### 10. GoalFormModal

**Purpose:** Create or edit a goal. A focused form with only the essential fields — name, description, target date, and color. Uses templates to lower creation friction for new users. Consistent with the TaskFormModal and HabitFormModal patterns.

**Screen Structure**

The GoalFormModal follows the same Modal pattern as TaskFormModal: overlay, white sheet, header with title ("New Goal" / "Edit Goal") and close button, scrollable body, footer with Cancel + Save buttons.

Form fields in order:

1. **Name** — required, single-line TextInput, placeholder "e.g. Launch MVP"
2. **Description** — optional, multiline, placeholder "What does success look like?"
3. **Target Date** — touchable input that opens the native date picker
4. **Color** — horizontal row of 7 colored circles (32px), each from the COLORS palette. Selected circle gets a 3px dark border. The default is primary blue.

**Visual Hierarchy**

Same consistent form hierarchy as TaskFormModal: labels are small and bold, inputs are bordered and comfortable, the color picker is visually playful with colored circles, and the save button anchors the bottom.

**Component Arrangement**

- Modal header: Title + close button
- Label + Input pairs
- Color row: flexWrap, gap sm, colored circles
- Footer: Cancel (ghost) + Create/Save (primary, with loading state)

**Interactions**

- Tapping a color circle selects it with a brief scale animation
- Name is validated as required
- Keyboard-aware scrolling

**States**

- **Create mode:** Title "New Goal," fields empty, button says "Create Goal"
- **Edit mode:** Title "Edit Goal," fields pre-filled, button says "Save Changes"
- **Saving state:** Primary button shows spinner
- **Error state:** Alert on API failure; modal stays open

**Creative Idea — "Goal Templates" Quick-Start**

At the top of the GoalFormModal, show a row of 3–4 template chips: "🏃 Fitness Goal," "💼 Career Goal," "📚 Learning Goal." Tapping a template pre-fills the name field and picks a relevant color (green for fitness, blue for career, purple for learning). This lowers the friction of goal creation — users don't have to think about what to name it or what color to pick. It also subtly teaches them that goals are meant to be specific domains.

---

### 11. GoalTaskLinkModal

**Purpose:** Enable the user to link one or more existing tasks to a goal. A multi-select picker modal with search, task checkboxes, a selected counter, and a link confirmation button. Streamlines the goal-task connection workflow.

**Screen Structure**

The GoalTaskLinkModal is a full Modal (not a bottom sheet) with the title "Link Tasks to Goal" and a search bar at the top. Below the search bar, a FlatList displays all available (non-deleted, unlinked) tasks. Each task is rendered as a compact row: checkbox on the left, title in the middle, priority dot on the right.

The user can select multiple tasks by tapping their checkboxes. Selected tasks get a blue-tinted highlight. A counter at the bottom of the modal shows "X tasks selected."

The footer has two buttons: "Cancel" (ghost) and "Link X Tasks" (primary).

**Visual Hierarchy**

The search bar is prominent for filtering through many tasks. The task list is scannable with clear selection indicators. The counter and primary button at the bottom create a clear completion path.

**Component Arrangement**

- Modal header: Title + close button
- Search bar: Full-width, white, magnifying glass
- Task list: Checkbox | Title | Priority dot
- Footer: Selection counter + Link button

**Interactions**

- Tapping a task checkbox toggles its selection
- Tapping "Link X Tasks" creates goal-task links and closes the modal
- Search filters in real-time

**States**

- **Empty state (no linkable tasks):** "No tasks available to link" with suggestion to create tasks first
- **Search no results:** "No tasks match your search"
- **Normal state:** List of tasks with checkboxes
- **Saving state:** Link button shows spinner
- **Success state:** Modal closes; GoalDetailScreen refreshes with new linked tasks

**Creative Idea — "Smart Suggestions" Top Row**

Before the task list, show a "Suggested" row of up to 3 tasks that are most relevant to the goal. Relevance is determined by: tasks in the same category, tasks with a similar name (keyword match), or recently created unscheduled tasks. Each suggested task has a "+" quick-add button that links it instantly without needing to select and confirm. This saves taps for the most common case — linking obviously related tasks.

---

### 12. HabitsListScreen

**Purpose:** The master list of all habits. Users browse their habits, toggle completion, filter by category, sort by streak or name, and create/delete habits. Acts as the management hub alongside the cockpit's quick-toggle view.

**Note:** This screen already exists. The design spec below validates and extends the existing implementation.

**Screen Structure**

The native header reads "Habits." The FAB floats at bottom-right. The main content is a FlatList of HabitRows.

**Recommended enhancement:** Add a category filter row at the top — horizontal scrollable chips (All, then each category). This lets users quickly filter habits by category. Also add a sort toggle between "By Streak" (highest streak first — gamification) and "By Name" (alphabetical).

Each HabitRow displays:

- A checkbox (24px square, bordered, filled green when done)
- Title (md, medium, strikethrough + muted when done)
- Description (xs, secondary, 1 line)
- Streak count + fire emoji (right side, colored amber for 1-6 days, red for 7+ days)

**Visual Hierarchy**

Habits with long streaks visually stand out through the colored fire emoji and bold number. Completed habits recede through strikethrough and muted styling. The filter chips at the top provide quick scoping.

**Component Arrangement**

- Header: "Habits" title
- Category filter row: Horizontal scrollable chips
- Sort toggle: Top-right corner
- FlatList of HabitRows
- FAB: Bottom-right
- Create modal (HabitFormModal): inline modal with name, description, category, color picker, actions

**Interactions**

- Tapping a HabitRow toggles completion with optimistic UI
- Long-pressing triggers delete confirmation ("Streak data will be lost")
- Tapping the FAB opens HabitFormModal in create mode
- Swiping left reveals delete action
- Pull-to-refresh reloads habits

**States**

- **Loading state:** LoadingSpinner with "Loading habits..."
- **Empty state:** EmptyState with 🌱 "No habits yet" and "Tap + to create your first habit"
- **Normal state:** Populated HabitRow list
- **Error state:** EmptyState with ⚠️ and pull-to-retry
- **Edge case — single habit:** One row, FAB visible for adding more
- **Edge case — very long habit name:** Title truncates at 1 line with ellipsis

**Creative Idea — "Streak Freeze" Suggestion**

When a habit with a 7+ day streak is uncompleted and it's past 8 PM, the app shows a subtle "Streak Freeze" card at the top of the HabitsListScreen: "Your 'Morning meditation' streak (12 days) is at risk! Complete it now or use a freeze." The "freeze" is a virtual token that preserves the streak for one missed day. Users earn one freeze token per week of consistent habit completion. This mechanic (popular in Duolingo) dramatically increases habit retention by giving users a safety net they don't want to waste.

---

### 13. HabitFormModal

**Purpose:** Create or edit a habit. A modal form with habit configuration fields: name, description, category, color, and recurrence. Includes a live preview so users see exactly how the habit will look in the cockpit before saving.

**Screen Structure**

The HabitFormModal follows the same Modal pattern. Header: "New Habit" or "Edit Habit." Scrollable body with form fields:

1. **Name** — required, single-line, placeholder "e.g. Morning meditation"
2. **Description** — optional, single-line, placeholder "What does this habit involve?"
3. **Category** — horizontal row of CategoryChip components, each bordered in its color. Tapping toggles selection (optional).
4. **Color** — horizontal row of 7 colored circles from COLORS. The selected color defines the habit's accent (used for the streak indicator and visual identity).
5. **Recurrence** — not yet implemented in the existing form, but should be added as a row of 3 pills: Daily, Weekdays Only, Custom. Custom opens inline day-of-week toggles (Mon–Sun).

**Visual Hierarchy**

Same consistent form pattern. The color picker is the most visually engaging element. Categories are secondary organizational tools.

**Component Arrangement**

- Modal header: Title + close
- Label + Input pairs
- Category chip row
- Color picker row
- Recurrence pills + custom day toggles
- Footer: Cancel (ghost) + Create/Save (primary with loading)

**Interactions**

- Tapping a category chip toggles it
- Tapping a color circle selects it
- Name is required, validated on save
- Keyboard-aware scrolling

**States**

- **Create mode:** Title "New Habit," fields empty/default
- **Edit mode:** Title "Edit Habit," fields pre-filled
- **Saving state:** Spinner on primary button
- **Error state:** Alert, modal stays open

**Creative Idea — "Habit Preview" Live Card**

As the user fills in the form, a live preview card at the bottom of the modal shows exactly how the habit will look in the cockpit: the checkbox, the title in the selected color, a simulated streak count, and the colored fire emoji. This gives instant visual feedback and makes form-filling feel creative rather than administrative.

---

### 14. CategoriesScreen

**Purpose:** Manage all categories — view, create, edit, and delete. Categories are the organizational backbone of the app, used by both habits and tasks. The screen shows each category's color, name, scope (habits/tasks/both), and provides quick editing. A usage summary helps users identify unused categories.

**Note:** This screen already exists. The design spec below validates and extends the existing implementation.

**Screen Structure**

The native header reads "Categories." The FAB floats at bottom-right. The main content is a FlatList of category cards.

Each category card is a white Card component containing a horizontal row:

- A small color circle (12px, filled with the category's color) on the left
- Category name (md, semibold) and scope label (xs, muted, capitalized: "both" / "task" / "habit")
- An "Edit" text button (primary blue, sm) and an "✕" delete button (danger red) on the right

**Recommended enhancement:** Add a section at the top of the list showing a "Category Usage" summary card — a horizontal bar chart showing how many habits and tasks use each category. This helps users see which categories are most valuable and which are unused (candidates for deletion).

**Visual Hierarchy**

Category color circles provide instant visual identification. The name and scope are primary information. Edit and delete actions are compact but accessible.

**Component Arrangement**

- Header: "Categories" title
- Usage summary card (optional enhancement)
- FlatList of CategoryCards
- FAB: Bottom-right
- Create/Edit modal: inline modal with name, color picker, "Applies To" toggle (Both / Task / Habit), and action buttons

**Interactions**

- Tapping "Edit" opens the modal pre-filled for editing
- Tapping "✕" triggers delete confirmation
- Tapping the FAB opens the modal in create mode
- Long-pressing a category card also triggers edit

**States**

- **Loading state:** LoadingSpinner with "Loading categories..."
- **Empty state:** EmptyState with 🏷️ "No categories" and "Categories help organize habits and tasks"
- **Normal state:** CategoryCards in a list
- **Error state:** EmptyState with ⚠️ and pull-to-retry
- **Edge case — many categories:** FlatList handles scrolling; color circles maintain visual distinction through the 7-color palette

**Creative Idea — "Category Blending" Quick Assign**

When viewing a category, show a "Quick Assign" section below it: a compact list of recent uncategorized habits and tasks. Each has a single-tap "Assign" button. This lets users retroactively organize their items without navigating away from the Categories screen.

---

### 15. AnalyticsScreen

**Purpose:** Provide a data-rich dashboard of productivity insights. Users review habit consistency (7-day bar chart), task trends (30-day line chart), goal progress (stacked list), activity heatmap (GitHub-style grid), and category distribution. A weekly narrative summary card gives a human-readable interpretation of the data.

**Screen Structure**

The AnalyticsScreen is a scrollable dashboard of charts and statistics. The native header reads "Analytics." The screen is divided into card-based sections, each with its own white Card component and section title.

**Section 1: Habit Overview Card**

- Title: "Habit Consistency"
- A 7-day horizontal bar chart showing daily completion percentage
- Each bar is colored by completion rate (red < 50%, amber 50-80%, green > 80%)
- Below the chart: "Longest active streak: 14 days 🔥" and "Average completion: 72%"

**Section 2: Task Trends Card**

- Title: "Task Trends (Last 30 Days)"
- A line chart showing tasks created vs. tasks completed per day
- Two lines: blue for created, green for completed
- Summary stats below: "Total completed: 47," "Completion rate: 68%," "Avg tasks/day: 3.2"

**Section 3: Goal Progress Card**

- Title: "Goal Progress"
- A stacked list of active goals, each with a ProgressBar and percentage
- Sorted by least-to-most progress (closest to completion first)

**Section 4: Weekly Heatmap Card**

- Title: "Activity Heatmap"
- A GitHub-style contribution grid: 7 rows (days of week) × ~12 columns (weeks)
- Cell color intensity based on total actions (habit completions + task completions) per day

**Section 5: Category Distribution Card**

- Title: "Where Your Time Goes"
- A horizontal stacked bar or donut-chart-like label list showing how tasks/habits distribute across categories

Each section is separated by xxxl vertical spacing. The screen is purely read-only — no editing capabilities.

**Visual Hierarchy**

Charts draw the eye through color and proportion. The habit consistency bar chart is the most prominent section (top position, most actionable). Section titles are lg semibold. Chart labels use xs/sm muted text to stay out of the way. Progress bars and heatmap cells use color to convey meaning without requiring reading.

**Component Arrangement**

- Header: "Analytics" title
- ScrollView containing stacked Cards:
  - Habit bar chart
  - Task line chart
  - Goal progress list
  - Activity heatmap grid
  - Category distribution

**Interactions**

- Tapping a day bar in the habit chart shows a tooltip with exact completion count
- Tapping a goal in the goal progress section navigates to GoalDetailScreen
- All charts are static (no real-time animation — data updates on pull-to-refresh)

**States**

- **Loading state:** Each card section shows a shimmer skeleton matching its shape (bars for chart, row shapes for lists)
- **Empty state (no data):** A single centered EmptyState with 📊 "Not enough data yet" and "Start tracking habits and tasks to see your analytics." Individual cards that have partial data still render.
- **Normal state:** Populated charts and stats
- **Error state:** "Couldn't load analytics" with retry button
- **Edge case — single data point:** Charts gracefully handle single-bar or single-day scenarios without looking broken

**Creative Idea — "Your Week in Review" Narrative Card**

At the very top of the AnalyticsScreen, before any charts, show a "Your Week in Review" narrative card that uses natural language: "This week you completed 85% of your habits — up 12% from last week. Your 'Morning meditation' streak hit 21 days. You closed 3 tasks but added 5 new ones — your backlog grew slightly." This is auto-generated from the data and reads like a coach's summary. It makes analytics feel personal, not statistical.

---

### 16. SettingsScreen

**Purpose:** Central place for app preferences. Users configure notification reminders, appearance (theme, default task view), data management (export, clear), and view app version/legal links. Also houses the Focus Mode toggle for distraction-free use.

**Screen Structure**

The SettingsScreen is accessed from the More tab and has a native header reading "Settings." The content is a ScrollView of grouped settings rows, each group separated by a section title and contained within a white Card.

**Section 1: Notifications**

- "Daily Reminder" — toggle switch with description "Get reminded to complete your habits" and a time picker sub-row (only visible when toggled on)
- "Evening Nudge" — toggle switch with description "Alert if habits are at risk after 5 PM"
- "Streak Alerts" — toggle switch with description "Celebrate when you hit streak milestones"

**Section 2: Appearance**

- "Theme" — row with three options displayed as selectable cards: Light, Dark, System. Currently selected card has a primary border.
- "Default Task View" — row with three pill options: "All Tasks" / "Today Only" / "This Week"

**Section 3: Data**

- "Export Data" — button row, opens share sheet with JSON export
- "Clear All Data" — danger-styled button, requires double confirmation (two alerts)

**Section 4: About**

- App version text (xs, muted)
- "Privacy Policy" link
- "Terms of Service" link

Each setting row is a horizontal row with a label on the left and the control on the right (toggle, picker, or navigation arrow).

**Visual Hierarchy**

Section titles (sm, uppercase, muted) provide grouping. Setting labels are md, medium, dark for readability. Toggle switches use the primary blue color when active. The "Clear All Data" button uses danger red and is visually separated from other settings.

**Component Arrangement**

- Header: "Settings" title
- ScrollView with grouped Card sections:
  - Notifications (3 toggle rows)
  - Appearance (theme cards, view pills)
  - Data (export, clear)
  - About (version, links)

**Interactions**

- Toggle switches animate smoothly
- Theme cards have a subtle scale-down on press
- "Clear All Data" triggers two Alert confirmations before executing
- "Export Data" triggers the native share sheet
- Privacy/Terms links open in the device browser

**States**

- **Loading state:** Not applicable (settings are local)
- **Normal state:** All controls reflecting current preferences
- **Error state:** Not applicable for settings
- **Edge case — clearing data during active sync:** Warns that data is syncing and asks to wait

**Creative Idea — "Focus Mode" Quick Toggle**

Add a "Focus Mode" card at the top of Settings. When enabled, it hides all analytics, streak counts, and progress bars from the cockpit — leaving only the bare task and habit lists with no numbers. This is for users who find gamification metrics stressful or distracting. The feature toggles with a single switch and applies instantly across the app.

---

### 17. WeeklyPlanningScreen

**Purpose:** A weekly planning tool for distributing backlog tasks across 7 day columns. Users visualize capacity per day (with color-coded bars), drag tasks from the backlog pool to specific days, or use Auto-Balance to let the app distribute tasks respecting priority and capacity limits. Overdue tasks from the prior week appear in a Carry Forward section.

**Screen Structure**

The WeeklyPlanningScreen is a planning tool for scheduling backlog tasks across a week. The native header reads "Weekly Plan" with the current week range as a subtitle (e.g., "Apr 27 – May 3, 2026").

The main layout is a horizontal ScrollView containing 7 day columns, each occupying roughly 70% of the screen width so part of the next column is always visible (carousel-style). Each column has:

- Day name and date at the top (e.g., "Mon 27")
- A "Capacity Bar" — a vertical progress bar showing how many tasks are already scheduled vs. a user-set daily capacity (default 5 tasks). Green if under capacity, amber if nearly full, red if over capacity.
- A list of tasks already scheduled for that day, rendered as compact cards with title and priority dot
- At the bottom of each column, a "+" button to manually add a task

Below the week columns, a "Backlog Pool" section shows unscheduled tasks as draggable cards (in practice, tappable cards with a "Schedule" action). This section has a "Auto-Balance" button that automatically distributes backlog tasks across the week, respecting daily capacity limits and priority order.

A "Carry Forward" card at the bottom shows overdue tasks from the previous week with options to reschedule each one individually or "Reschedule All" to push them to today.

**Visual Hierarchy**

The day columns are the primary content — they show the week at a glance with capacity indicators. The capacity bar is the most scannable element per column. The Backlog Pool is secondary but important as the "source" of tasks to schedule. The Auto-Balance button is primary blue and positioned prominently.

**Component Arrangement**

- Header: "Weekly Plan" title + week range subtitle
- Horizontal ScrollView of 7 day columns: Date header, capacity bar, task list, add button
- Backlog Pool section: Task cards + "Schedule" button per task + "Auto-Balance" button
- Carry Forward section: Overdue task cards + "Reschedule All" button

**Interactions**

- Swiping horizontally navigates between days
- Tapping a backlog task card and then tapping a day column schedules it to that day
- Alternative: tapping "Schedule" on a backlog task opens a quick date picker
- "Auto-Balance" distributes tasks automatically with a brief animation showing tasks flying to columns
- Capacity bar colors update live as tasks are added
- Tapping the daily capacity number lets the user change it (default 5)

**States**

- **Loading state:** Each column shows skeleton placeholders; backlog pool shows shimmer cards
- **Empty state (no backlog):** "All tasks are scheduled!" with a 🎉 icon
- **Empty state (no tasks at all):** "No tasks to plan" with suggestion to create tasks first
- **Normal state:** Populated columns and backlog pool
- **Edge case — over-capacity day:** Capacity bar turns red; a small warning icon appears next to the day header

**Creative Idea — "Drag-to-Day" Cross-Column Gesture**

Implement a true drag-and-drop interaction: the user can long-press a task card in the backlog pool and drag it directly onto a day column, which highlights with a blue border as the drag hovers over it. Dropping the task schedules it instantly with a satisfying spring animation. This makes weekly planning feel tactile and game-like rather than form-filling.

---

### 18. OnboardingScreen (Refined)

**Purpose:** A polished version of Screen #1 with enhanced visual details — gradient background, per-step accent colors, breathing button animation on the final step, and a curtain-reveal transition into the app. Creates a premium first impression.

**Design Refinement**

The OnboardingScreen now uses a background gradient (subtle: from white at the top to the app's `#F5F7FA` background at the bottom) instead of flat white. Each of the 3 steps has its own dominant accent color that tints the illustration area: blue for step 1 (habits), green for step 2 (tasks/planning), purple for step 3 (goals). The progress dots now use the step's accent color.

The "Get Started" button on step 3 receives an additional micro-interaction: it pulses with a soft breathing animation (scale 1.0 → 1.03 → 1.0 over 2 seconds, looping) to draw attention.

After tapping "Get Started," instead of an abrupt transition, the screen performs a "curtain reveal": the content slides up and fades out while the DailyCockpitScreen fades in behind it, creating a sense that the onboarding is literally "unveiling" the app.

---

## Consistency Audit Across All Screens

| Pattern                                                             | Applied consistently?                             |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| Screen padding (lg=16px)                                            | ✅ All content areas use lg horizontal padding    |
| Card style (white, radius md, shadow)                               | ✅ All cards across all screens                   |
| Section headers (title left, action right)                          | ✅ Cockpit, GoalDetail, Analytics                 |
| Form modals (Modal + header + ScrollView + footer)                  | ✅ TaskFormModal, HabitFormModal, GoalFormModal   |
| Empty states (icon + title + subtitle)                              | ✅ All screens                                    |
| Loading states (LoadingSpinner with contextual message)             | ✅ All screens                                    |
| Error states (EmptyState with ⚠️ + retry guidance)                  | ✅ All screens                                    |
| FAB (56px, primary, bottom-right, "+" icon)                         | ✅ Present on 8 screens where creation is primary |
| Option pills (border, border-radius full, primary fill when active) | ✅ TaskFormModal, HabitFormModal, SettingsScreen  |
| Color palette (COLORS array, 7 colors)                              | ✅ Used consistently for all color pickers        |
| Typography hierarchy (heading/xxl/xl/lg/md/sm/xs)                   | ✅ Used consistently everywhere                   |

---

## Summary of Creative Ideas Per Screen

| Screen                         | Creative Idea                                       |
| ------------------------------ | --------------------------------------------------- |
| 1. OnboardingScreen            | Personality picker quiz pre-populates sample data   |
| 2. DailyCockpitScreen          | "Momentum Pulse" thin progress line at top          |
| 3. TaskDetailScreen            | Quick-note swipe-in for inline description editing  |
| 4. TaskFormModal               | Swipe gestures on priority/status chips             |
| 5. MonthlyCalendarScreen       | Past-day red/green subtle tint heatmap              |
| 6. DateDetailScreen            | "Morning Brief" contextual summary card             |
| 7. BacklogScreen               | "Weekend Sweep" Friday planning prompt              |
| 8. GoalsListScreen             | Confetti burst on goal completion                   |
| 9. GoalDetailScreen            | Vertical milestone timeline for linked tasks        |
| 10. GoalFormModal              | Goal template chips (Fitness/Career/Learning)       |
| 11. GoalTaskLinkModal          | Smart-suggested tasks row                           |
| 12. HabitsListScreen           | Streak freeze mechanic (1 freeze earned per week)   |
| 13. HabitFormModal             | Live preview card of the habit as you create it     |
| 14. CategoriesScreen           | Quick-assign section for uncategorized items        |
| 15. AnalyticsScreen            | Narrative "Your Week in Review" summary card        |
| 16. SettingsScreen             | Focus Mode toggle (hide all numbers/gamification)   |
| 17. WeeklyPlanningScreen       | Drag-and-drop task scheduling with spring animation |
| 18. OnboardingScreen (refined) | Gradient background + curtain-reveal transition     |
