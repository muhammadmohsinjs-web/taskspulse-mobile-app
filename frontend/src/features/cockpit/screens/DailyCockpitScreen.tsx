import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import { TodayStackParamList } from "../../../types";
import { useCockpit } from "../hooks/useCockpit";
import { useToggleHabit } from "../../habits/hooks/useHabits";
import { useUpdateTask } from "../../tasks/hooks/useTasks";
import HabitRow from "../../habits/components/HabitRow";
import StreakBadge from "../../habits/components/StreakBadge";
import ProgressBar from "../../../components/ui/ProgressBar";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { CockpitHabit, CockpitTask } from "../../../types";

const DailyCockpitScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TodayStackParamList>>();
  const { data, isLoading, isError, refetch } = useCockpit();
  const toggleHabit = useToggleHabit();
  const updateTask = useUpdateTask();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleHabitToggle = useCallback(
    (habit: CockpitHabit) => {
      toggleHabit.mutate(
        { id: habit.id, completedToday: habit.completedToday },
        {
          onError: (e: any) => {
            Alert.alert("Error", e.message || "Failed to update habit");
          },
        }
      );
    },
    [toggleHabit]
  );

  const handleTaskToggle = useCallback(
    (task: CockpitTask) => {
      const newStatus = task.status === "done" ? "todo" : "done";
      updateTask.mutate(
        { id: task.id, payload: { status: newStatus } },
        {
          onError: (e: any) => {
            Alert.alert("Error", e.message || "Failed to update task");
          },
        }
      );
    },
    [updateTask]
  );

  if (isLoading) return <LoadingSpinner message="Loading today's plan..." />;

  if (isError) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="⚠️" title="Couldn't load cockpit" subtitle="Pull down to retry" />
      </View>
    );
  }

  const { habits, tasks, globalStreak } = data!;
  const today = new Date();
  const isEvening = today.getHours() >= 17;
  const atRiskHabits = isEvening
    ? habits.filter((h) => !h.completedToday && h.currentStreak >= 3)
    : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.heading}>Today</Text>
              <Text style={styles.date}>
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            {/* Global Streak */}
            {habits.length > 0 ? (
              <View style={styles.streakCard}>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakLabel}>Daily Progress</Text>
                  <Text style={styles.streakStats}>
                    {globalStreak.completedToday} / {globalStreak.totalHabits} habits
                  </Text>
                </View>
                <View style={styles.streakBadgeWrap}>
                  <StreakBadge
                    currentStreak={habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)}
                    longestStreak={habits.reduce((max, h) => Math.max(max, h.longestStreak), 0)}
                  />
                </View>
                <ProgressBar
                  progress={globalStreak.completionRate / 100}
                  color={globalStreak.streakActive ? theme.colors.success : theme.colors.primary}
                />
              </View>
            ) : null}

            {/* Streak Nudge */}
            {atRiskHabits.length > 0 && (
              <View style={styles.nudge}>
                <Text style={styles.nudgeIcon}>⚡</Text>
                <Text style={styles.nudgeText}>
                  {atRiskHabits.length} habit{atRiskHabits.length > 1 ? "s" : ""} at risk! Complete before the day ends.
                </Text>
              </View>
            )}

            {/* Habits Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Habits</Text>
                <TouchableOpacity onPress={() => navigation.navigate("HabitsList")}>
                  <Text style={styles.sectionAction}>Manage</Text>
                </TouchableOpacity>
              </View>

              {habits.length === 0 ? (
                <EmptyState
                  icon="🌱"
                  title="No habits yet"
                  subtitle="Create your first habit to start building streaks"
                />
              ) : (
                habits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    onToggle={() => handleHabitToggle(habit)}
                  />
                ))
              )}
            </View>

            {/* Tasks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tasks</Text>
                <TouchableOpacity onPress={() => navigation.navigate("TaskList")}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>

              {tasks.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="No tasks for today"
                  subtitle="Add a task to get started"
                />
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskRow}
                    onPress={() => handleTaskToggle(task)}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.taskCheckbox,
                        task.status === "done" && styles.taskCheckboxDone,
                      ]}
                    >
                      <Text style={styles.taskCheckmark}>
                        {task.status === "done" ? "✓" : "○"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.status === "done" && styles.taskTitleDone,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor:
                            task.priority === "urgent"
                              ? theme.colors.danger
                              : task.priority === "high"
                              ? theme.colors.warning
                              : theme.colors.textMuted,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: theme.spacing.xxxl },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.lg,
  },
  heading: { fontSize: theme.fontSize.heading, fontWeight: "800", color: theme.colors.textPrimary },
  date: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
  streakCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow,
  },
  streakInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  streakLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: "500" },
  streakStats: { fontSize: theme.fontSize.sm, color: theme.colors.textPrimary, fontWeight: "600" },
  streakBadgeWrap: { alignItems: "center", marginBottom: theme.spacing.md },
  nudge: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    backgroundColor: "#FEF3C7",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  nudgeIcon: { fontSize: 18, marginRight: theme.spacing.sm },
  nudgeText: { flex: 1, fontSize: theme.fontSize.sm, color: "#92400E", fontWeight: "500" },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary },
  sectionAction: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: "600" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
  },
  taskCheckbox: { marginRight: theme.spacing.md },
  taskCheckmark: { fontSize: 20, color: theme.colors.primary },
  taskCheckboxDone: {},
  taskTitle: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.textPrimary },
  taskTitleDone: { textDecorationLine: "line-through", color: theme.colors.textMuted },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },
});

export default DailyCockpitScreen;
