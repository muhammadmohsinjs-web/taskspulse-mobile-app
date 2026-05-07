import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone, timedelta
from database import SessionLocal, Base, engine
from modules.auth.security import hash_password

Base.metadata.create_all(bind=engine)

EMAIL = "test@test.com"
PASSWORD = "12345678"


def seed():
    db = SessionLocal()
    try:
        # --- User ---
        from modules.auth.models import User
        user = db.query(User).filter(User.email == EMAIL).first()
        if not user:
            user = User(
                email=EMAIL,
                display_name="Test User",
                password_hash=hash_password(PASSWORD),
                email_verified=True,
                email_verified_at=datetime.now(timezone.utc),
                is_active=True,
            )
            db.add(user)
            db.flush()
            print(f"Created user: {EMAIL}")
        else:
            print(f"User already exists: {EMAIL}")

        user_id = user.id

        # --- Categories ---
        from modules.categories.models import Category
        cat_data = [
            ("Work", "#4A90D9", "briefcase", "both"),
            ("Personal", "#7B68EE", "user", "both"),
            ("Health", "#2ECC71", "heart", "both"),
            ("Learning", "#F39C12", "book-open", "both"),
            ("Finance", "#E74C3C", "dollar-sign", "task"),
        ]
        cat_map = {}
        for name, color, icon, applies_to in cat_data:
            cat = db.query(Category).filter(
                Category.user_id == user_id, Category.name == name
            ).first()
            if not cat:
                cat = Category(
                    user_id=user_id, name=name, color=color, icon=icon, applies_to=applies_to
                )
                db.add(cat)
                db.flush()
                print(f"  Created category: {name}")
            else:
                print(f"  Category exists: {name}")
            cat_map[name] = cat.id

        # --- Goals ---
        from modules.goals.models import Goal
        goals_data = [
            ("Launch MVP", "Ship the initial version of TasksPulse to beta testers by end of quarter", "2026-06-30", "#4A90D9"),
            ("Get Fit", "Build a consistent workout routine and hit 30 exercise days in a row", "2026-08-01", "#2ECC71"),
            ("Learn TypeScript", "Complete advanced TypeScript course and refactor existing codebase", "2026-07-15", "#F39C12"),
        ]
        goal_map = {}
        for title, desc, target, color in goals_data:
            g = db.query(Goal).filter(
                Goal.user_id == user_id, Goal.title == title
            ).first()
            if not g:
                g = Goal(
                    user_id=user_id, title=title, description=desc,
                    target_date=target, color=color,
                )
                db.add(g)
                db.flush()
                print(f"  Created goal: {title}")
            else:
                print(f"  Goal exists: {title}")
            goal_map[title] = g.id

        # --- Tasks ---
        from modules.tasks.models import Task
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
        next_week = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")

        tasks_data = [
            # Active tasks
            ("Finish project report", "Complete the quarterly project report for stakeholders", "in_progress", "high", tomorrow, "Work"),
            ("Team standup prep", "Prepare notes for the daily standup meeting", "todo", "medium", today, "Work"),
            ("Buy groceries", "Milk, eggs, bread, vegetables, and fruit", "todo", "medium", today, "Personal"),
            ("Morning run", "30-minute run in the park", "todo", "high", today, "Health"),
            ("Read React Native docs", "Go through the latest RN navigation guide", "in_progress", "low", next_week, "Learning"),
            ("Review PR #42", "Review the open pull request for the auth module", "todo", "medium", tomorrow, "Work"),
            ("Pay electricity bill", "Pay the monthly electricity bill before due date", "todo", "urgent", tomorrow, "Finance"),
            ("Gym workout", "Upper body strength training session", "done", "medium", today, "Health"),
            ("Complete TypeScript module 3", "Finish the generics and advanced types section", "in_progress", "high", next_week, "Learning"),
            ("Plan weekend trip", "Research destinations and book accommodations", "todo", "low", next_week, "Personal"),
            # Backlog — no due date
            ("Rewrite legacy auth service", "Refactor the old auth service to use the new security module", "todo", "low", None, "Work"),
            ("Add dark mode support", "Implement dark mode toggle across all screens", "todo", "low", None, "Work"),
            ("Write unit tests for habits", "Add comprehensive test coverage for the habits module", "todo", "medium", None, "Learning"),
            ("Organize photo library", "Sort and backup photos from the last 6 months", "todo", "low", None, "Personal"),
            ("Research meal prep ideas", "Look into healthy meal prep recipes for the week", "todo", "low", None, "Health"),
        ]
        task_map = {}
        for title, desc, status, priority, due, cat_name in tasks_data:
            t = db.query(Task).filter(
                Task.user_id == user_id, Task.title == title
            ).first()
            if not t:
                completed_at = None
                if status == "done":
                    completed_at = datetime.now(timezone.utc).isoformat()
                t = Task(
                    user_id=user_id, title=title, description=desc,
                    status=status, priority=priority, due_date=due,
                    category_id=cat_map.get(cat_name),
                    completed_at=completed_at,
                )
                db.add(t)
                db.flush()
                print(f"  Created task: {title}")
            else:
                print(f"  Task exists: {title}")
            task_map[title] = t.id

        # --- Goal-Task Links ---
        from modules.goals.models import GoalTaskLink
        links = [
            ("Launch MVP", "Finish project report"),
            ("Launch MVP", "Review PR #42"),
            ("Launch MVP", "Rewrite legacy auth service"),
            ("Get Fit", "Morning run"),
            ("Get Fit", "Gym workout"),
            ("Get Fit", "Research meal prep ideas"),
            ("Learn TypeScript", "Complete TypeScript module 3"),
            ("Learn TypeScript", "Read React Native docs"),
            ("Learn TypeScript", "Write unit tests for habits"),
        ]
        for goal_name, task_title in links:
            existing = db.query(GoalTaskLink).filter(
                GoalTaskLink.goal_id == goal_map[goal_name],
                GoalTaskLink.task_id == task_map[task_title],
            ).first()
            if not existing:
                link = GoalTaskLink(
                    user_id=user_id,
                    goal_id=goal_map[goal_name],
                    task_id=task_map[task_title],
                )
                db.add(link)
                print(f"  Linked task '{task_title}' -> goal '{goal_name}'")

        # --- Habits ---
        from modules.habits.models import Habit, HabitLog, HabitStreak
        habits_data = [
            ("Morning meditation", "10-minute mindfulness meditation after waking up", '{"type":"daily"}', "#7B68EE", "Health"),
            ("Read 20 pages", "Read at least 20 pages of a book every day", '{"type":"daily"}', "#F39C12", "Learning"),
            ("Drink 8 glasses of water", "Stay hydrated throughout the day", '{"type":"daily"}', "#2ECC71", "Health"),
            ("Write in journal", "Evening journal entry, 5 minutes minimum", '{"type":"daily"}', "#4A90D9", "Personal"),
            ("Weekly review", "Review the week's accomplishments and plan next week", '{"type":"weekly","interval":1,"days":[6]}', "#E74C3C", "Work"),
        ]
        habit_map = {}
        for title, desc, rule, color, cat_name in habits_data:
            h = db.query(Habit).filter(
                Habit.user_id == user_id, Habit.title == title
            ).first()
            if not h:
                h = Habit(
                    user_id=user_id, title=title, description=desc,
                    recurrence_rule=rule, color=color,
                    category_id=cat_map.get(cat_name),
                )
                db.add(h)
                db.flush()
                print(f"  Created habit: {title}")
            else:
                print(f"  Habit exists: {title}")
            habit_map[title] = h.id

        # --- Habit Logs (last 7 days for daily habits) ---
        daily_habits = ["Morning meditation", "Read 20 pages", "Drink 8 glasses of water"]
        for hname in daily_habits:
            hid = habit_map[hname]
            for i in range(7):
                d = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
                existing = db.query(HabitLog).filter(
                    HabitLog.habit_id == hid,
                    HabitLog.completed_date == d,
                ).first()
                if not existing:
                    log = HabitLog(
                        user_id=user_id, habit_id=hid, completed_date=d,
                    )
                    db.add(log)

        # --- Habit Streaks ---
        for hname in daily_habits:
            hid = habit_map[hname]
            streak = db.query(HabitStreak).filter(
                HabitStreak.habit_id == hid
            ).first()
            if not streak:
                last_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                streak = HabitStreak(
                    user_id=user_id, habit_id=hid,
                    current_streak=7, longest_streak=7,
                    last_completed_date=last_date,
                )
                db.add(streak)
                print(f"  Created streak for: {hname} (7 days)")

        # Also add a partial streak for journal
        jid = habit_map["Write in journal"]
        js = db.query(HabitStreak).filter(HabitStreak.habit_id == jid).first()
        if not js:
            for i in range(3):
                d = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
                existing = db.query(HabitLog).filter(
                    HabitLog.habit_id == jid,
                    HabitLog.completed_date == d,
                ).first()
                if not existing:
                    log = HabitLog(user_id=user_id, habit_id=jid, completed_date=d)
                    db.add(log)
            last_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            js = HabitStreak(
                user_id=user_id, habit_id=jid,
                current_streak=3, longest_streak=5,
                last_completed_date=last_date,
            )
            db.add(js)
            print(f"  Created streak for: Write in journal (3 days)")

        db.commit()
        print("\nSeed complete!")
        print(f"  Login: {EMAIL} / {PASSWORD}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
