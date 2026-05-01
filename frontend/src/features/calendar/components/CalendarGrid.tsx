import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import CalendarDayCell from "./CalendarDayCell";
import { Task } from "../../../types";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed (0 = Jan)
  tasks: Task[];
  onDayPress: (dateStr: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS_LIST = [
  "#4A90D9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4",
];

const CalendarGrid: React.FC<CalendarGridProps> = ({ year, month, tasks, onDayPress }) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, { count: number; colors: string[] }> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      if (!map[t.dueDate]) {
        map[t.dueDate] = { count: 0, colors: [] };
      }
      map[t.dueDate].count++;
      // Assign a color based on task priority for visual variety
      const colorIndex = map[t.dueDate].count % COLORS_LIST.length;
      map[t.dueDate].colors.push(COLORS_LIST[colorIndex]);
    }
    return map;
  }, [tasks]);

  const gridDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Previous month's trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    // Next month's leading days
    const remaining = 42 - days.length; // 6 rows * 7 cols
    const nextMonth = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {gridDays.map((d, i) => {
          const info = tasksByDate[d.dateStr];
          return (
            <CalendarDayCell
              key={i}
              day={d.day}
              dateStr={d.dateStr}
              isToday={d.dateStr === todayStr}
              isCurrentMonth={d.isCurrentMonth}
              taskCount={info?.count ?? 0}
              categoryColors={info?.colors ?? []}
              onPress={onDayPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  weekdayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
});

export default CalendarGrid;
