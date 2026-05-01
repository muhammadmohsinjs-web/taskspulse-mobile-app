import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { theme } from "../../../theme/theme";
import { getErrorMessage } from "../../../utils/error";
import { useWeekView, useFocusQueue, useAutoBalance, useCarryForward } from "../hooks/usePlanning";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import type { WeekDay, FocusTask } from "../../../types/planning";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: theme.colors.danger,
  high: theme.colors.warning,
  medium: theme.colors.primary,
  low: theme.colors.textMuted,
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

function isCurrentWeek(weekStart: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return weekStart === getWeekStart(new Date(today));
}

type PlanningTab = "week" | "focus";

const WeeklyPlanningScreen: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [activeTab, setActiveTab] = useState<PlanningTab>("week");
  const [refreshing, setRefreshing] = useState(false);

  const { data: weekView, isLoading, isError, refetch } = useWeekView(currentWeekStart);
  const { data: focusQueue, isLoading: focusLoading, refetch: refetchFocus } = useFocusQueue();
  const autoBalance = useAutoBalance();
  const carryForward = useCarryForward();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchFocus()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchFocus]);

  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  const goToThisWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  const handleAutoBalance = useCallback(() => {
    autoBalance.mutate(
      { weekStartDate: currentWeekStart, maxTasksPerDay: 5 },
      {
        onSuccess: (data) => {
          Alert.alert(
            data.balanced ? "Balanced" : "No changes",
            data.movedCount > 0
              ? `Moved ${data.movedCount} task${data.movedCount === 1 ? "" : "s"} to balance your week.`
              : "All days are already balanced.",
          );
          refetch();
        },
        onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to auto-balance")),
      }
    );
  }, [autoBalance, currentWeekStart, refetch]);

  const handleCarryForward = useCallback(() => {
    carryForward.mutate(
      { targetWeekStart: currentWeekStart },
      {
        onSuccess: (data) => {
          Alert.alert(
            "Done",
            data.movedCount > 0
              ? `${data.movedCount} overdue task${data.movedCount === 1 ? "" : "s"} moved to this week.`
              : "No overdue tasks found.",
          );
          refetch();
          refetchFocus();
        },
        onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to carry forward")),
      }
    );
  }, [carryForward, currentWeekStart, refetch, refetchFocus]);

  const renderDayColumn = (day: WeekDay, index: number) => {
    const today = isToday(day.date);
    const visibleTasks = day.tasks.slice(0, 4);
    const overflow = day.tasks.length - 4;

    return (
      <View
        key={day.date}
        style={[styles.dayColumn, today && styles.dayColumnToday]}
      >
        <View style={[styles.dayHeader, today && styles.dayHeaderToday]}>
          <Text style={[styles.dayName, today && styles.dayNameToday]}>
            {DAY_NAMES[index]}
          </Text>
          <Text style={[styles.dayDate, today && styles.dayDateToday]}>
            {formatDateLabel(day.date)}
          </Text>
        </View>

        <View style={styles.capacityRow}>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                {
                  width: `${Math.min(day.capacityPct, 100)}%`,
                  backgroundColor: day.overloaded
                    ? theme.colors.danger
                    : day.capacityPct > 60
                      ? theme.colors.warning
                      : theme.colors.success,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.capacityCount, day.overloaded && styles.capacityCountOverloaded]}
          >
            {day.taskCount}
          </Text>
        </View>

        {day.tasks.length === 0 ? (
          <Text style={styles.noTasksText}>—</Text>
        ) : (
          visibleTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.dayTask, task.status === "done" && styles.dayTaskDone]}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: PRIORITY_COLORS[task.priority] || theme.colors.textMuted },
                ]}
              />
              <Text
                style={[styles.dayTaskText, task.status === "done" && styles.dayTaskTextDone]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>
          ))
        )}
        {overflow > 0 && (
          <Text style={styles.overflowText}>+{overflow} more</Text>
        )}
      </View>
    );
  };

  const renderFocusTask = (task: FocusTask) => (
    <View key={task.id} style={styles.focusTask}>
      <View style={styles.focusTaskLeft}>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: PRIORITY_COLORS[task.priority] || theme.colors.textMuted },
          ]}
        />
        <View style={styles.focusTaskInfo}>
          <Text style={styles.focusTaskTitle} numberOfLines={1}>
            {task.title}
          </Text>
          {task.dueDate && (
            <Text style={styles.focusTaskDate}>Due: {task.dueDate}</Text>
          )}
        </View>
      </View>
      <View style={styles.focusTaskTags}>
        {task.isOverdue && (
          <View style={styles.tagDanger}>
            <Text style={styles.tagDangerText}>Overdue</Text>
          </View>
        )}
        {task.isUnscheduled && (
          <View style={styles.tagMuted}>
            <Text style={styles.tagMutedText}>Unscheduled</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading && !weekView) return <LoadingSpinner message="Loading your week..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Actions row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleAutoBalance}
          disabled={autoBalance.isPending}
        >
          <Text style={styles.actionBtnText}>
            {autoBalance.isPending ? "..." : "Auto-balance"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleCarryForward}
          disabled={carryForward.isPending}
        >
          <Text style={styles.actionBtnText}>
            {carryForward.isPending ? "..." : "Carry forward"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "week" && styles.tabBtnActive]}
          onPress={() => setActiveTab("week")}
        >
          <Text style={[styles.tabBtnText, activeTab === "week" && styles.tabBtnTextActive]}>
            Week View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "focus" && styles.tabBtnActive]}
          onPress={() => setActiveTab("focus")}
        >
          <Text style={[styles.tabBtnText, activeTab === "focus" && styles.tabBtnTextActive]}>
            Focus Queue
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "week" ? (
        <>
          {/* Week navigation */}
          <View style={styles.weekNav}>
            <TouchableOpacity onPress={goToPrevWeek} style={styles.navBtn}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToThisWeek} style={styles.weekLabel}>
              <Text style={styles.weekLabelText}>{weekView?.weekLabel || "This Week"}</Text>
              {!isCurrentWeek(currentWeekStart) && (
                <Text style={styles.backToTodayText}>Tap for today</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNextWeek} style={styles.navBtn}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          {weekView && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {weekView.totalTasks} tasks · {weekView.avgTasksPerDay}/day avg
              </Text>
            </View>
          )}

          {/* Day columns */}
          {isError ? (
            <EmptyState icon="⚠️" title="Couldn't load week" subtitle="Pull down to retry" />
          ) : weekView ? (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.columnsContainer}
              >
                {weekView.days.map((day, i) => renderDayColumn(day, i))}
              </ScrollView>

              {weekView.totalTasks > 0 && (
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.legendText}>Light</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                    <Text style={styles.legendText}>Busy</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
                    <Text style={styles.legendText}>Overloaded</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <EmptyState icon="📅" title="No tasks" subtitle="Add tasks with due dates to see your week" />
          )}
        </>
      ) : (
        <>
          {focusLoading && !focusQueue ? (
            <View style={{ padding: theme.spacing.xxxl }}>
              <LoadingSpinner message="Loading focus queue..." />
            </View>
          ) : !focusQueue ? (
            <EmptyState icon="⚠️" title="Couldn't load focus queue" subtitle="Pull down to retry" />
          ) : focusQueue.totalPending === 0 ? (
            <EmptyState icon="🎯" title="All caught up!" subtitle="No pending tasks. Great work." />
          ) : (
            <View style={styles.focusContent}>
              {focusQueue.overdue.length > 0 && (
                <View style={styles.focusSection}>
                  <Text style={styles.focusSectionTitle}>
                    Overdue ({focusQueue.overdue.length})
                  </Text>
                  {focusQueue.overdue.map(renderFocusTask)}
                </View>
              )}

              {focusQueue.highPriority.length > 0 && (
                <View style={styles.focusSection}>
                  <Text style={styles.focusSectionTitle}>
                    High Priority ({focusQueue.highPriority.length})
                  </Text>
                  {focusQueue.highPriority.map(renderFocusTask)}
                </View>
              )}

              {focusQueue.unscheduled.length > 0 && (
                <View style={styles.focusSection}>
                  <Text style={styles.focusSectionTitle}>
                    Unscheduled ({focusQueue.unscheduled.length})
                  </Text>
                  {focusQueue.unscheduled.map(renderFocusTask)}
                </View>
              )}
            </View>
          )}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabBtnTextActive: {
    color: "#FFF",
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnText: {
    fontSize: 22,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  weekLabel: {
    marginHorizontal: theme.spacing.xl,
    alignItems: "center",
  },
  weekLabelText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  backToTodayText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginTop: 2,
  },
  statsRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  statText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  columnsContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dayColumn: {
    width: 130,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadow,
  },
  dayColumnToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  dayHeader: {
    marginBottom: theme.spacing.sm,
  },
  dayHeaderToday: {},
  dayName: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
  },
  dayNameToday: {
    color: theme.colors.primary,
  },
  dayDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  dayDateToday: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  capacityBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  capacityFill: {
    height: "100%",
    borderRadius: 2,
  },
  capacityCount: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    minWidth: 18,
    textAlign: "right",
  },
  capacityCountOverloaded: {
    color: theme.colors.danger,
  },
  noTasksText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
  dayTask: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: theme.spacing.xs,
  },
  dayTaskDone: {
    opacity: 0.5,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayTaskText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  dayTaskTextDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  overflowText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: theme.spacing.xs,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  focusContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  focusSection: {
    marginBottom: theme.spacing.xl,
  },
  focusSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  focusTask: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.shadow,
  },
  focusTaskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.sm,
  },
  focusTaskInfo: {
    flex: 1,
  },
  focusTaskTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  focusTaskDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  focusTaskTags: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  tagDanger: {
    backgroundColor: theme.colors.danger + "15",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagDangerText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.danger,
  },
  tagMuted: {
    backgroundColor: theme.colors.textMuted + "20",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tagMutedText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
});

export default WeeklyPlanningScreen;
