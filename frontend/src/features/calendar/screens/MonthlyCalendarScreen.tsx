import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { useTasks } from "../../tasks/hooks/useTasks";
import CalendarGrid from "../components/CalendarGrid";
import Card from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { CalendarStackParamList } from "../../../types/navigation";

type MonthlyCalendarNavProp = NativeStackNavigationProp<CalendarStackParamList, "MonthlyCalendar">;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MonthlyCalendarScreen: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const navigation = useNavigation<MonthlyCalendarNavProp>();

  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  const { data: tasks, isLoading, isError, refetch } = useTasks({ skip: 0, limit: 500 });
  const monthTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => t.dueDate?.startsWith(monthStr));
  }, [tasks, monthStr]);

  const { refreshControl } = useRefreshControl({ refetch });

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, [today]);

  const handleDayPress = useCallback(
    (dateStr: string) => {
      navigation.navigate("DateDetail", { date: dateStr });
    },
    [navigation]
  );

  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Compute 7-day quick select chips
  const dayChips = useMemo(() => {
    const chips: { label: string; dateStr: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label =
        i === 0
          ? "Today"
          : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      chips.push({ label, dateStr, isToday: i === 0 });
    }
    return chips;
  }, [today]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
      >
        {/* Month header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowBtn}>
            <Text style={styles.arrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.arrowBtn}>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          {!isCurrentMonth && (
            <TouchableOpacity onPress={goToToday} style={styles.todayPill}>
              <Text style={styles.todayPillText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Calendar grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading calendar..." />
        ) : (
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            tasks={monthTasks}
            onDayPress={handleDayPress}
          />
        )}

        {/* Week quick-select strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekStrip}
          contentContainerStyle={styles.weekStripContent}
        >
          {dayChips.map((chip) => (
            <TouchableOpacity
              key={chip.dateStr}
              style={[
                styles.dayChip,
                chip.isToday && styles.dayChipToday,
              ]}
              onPress={() => handleDayPress(chip.dateStr)}
            >
              <Text
                style={[
                  styles.dayChipText,
                  chip.isToday && styles.dayChipTextToday,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Month summary card */}
        <Card style={styles.summaryCard}>
          {isError ? (
            <View style={styles.summaryError}>
              <Text style={styles.summaryIcon}>⚠️</Text>
              <Text style={styles.summaryText}>Couldn't load task data</Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text style={styles.retryLink}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : monthTasks.length === 0 ? (
            <View style={styles.summaryEmpty}>
              <Text style={styles.summaryIcon}>📅</Text>
              <Text style={styles.summaryText}>No tasks scheduled this month</Text>
              <Text style={styles.summarySubText}>
                Tap a date to add tasks
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.summaryTitle}>Monthly Overview</Text>
              <Text style={styles.summaryStat}>
                {monthTasks.length} task{monthTasks.length !== 1 ? "s" : ""} scheduled
              </Text>
              <Text style={styles.summaryStat}>
                {monthTasks.filter((t) => t.status === "done").length} completed
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxxl,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  arrowBtn: {
    padding: theme.spacing.sm,
  },
  arrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  monthTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    minWidth: 160,
    textAlign: "center",
  },
  todayPill: {
    position: "absolute",
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  todayPillText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  weekStrip: {
    marginTop: theme.spacing.md,
  },
  weekStripContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayChipToday: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  dayChipTextToday: {
    color: "#FFFFFF",
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  summaryStat: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  summaryError: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  summaryEmpty: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  summaryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  summarySubText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  retryLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: theme.spacing.sm,
  },
});

export default MonthlyCalendarScreen;
