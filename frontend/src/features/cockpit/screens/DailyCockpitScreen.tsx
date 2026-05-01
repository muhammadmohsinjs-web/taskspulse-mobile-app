import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { TodayStackParamList } from "../../../types";
import { useCockpit } from "../hooks/useCockpit";
import { useUpdateTask } from "../../tasks/hooks/useTasks";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { CockpitTask } from "../../../types";
import { AppIcon, icons } from "../../../components/ui/Icon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STAT_CARD_WIDTH = (SCREEN_WIDTH - theme.spacing.lg * 2 - theme.spacing.sm * 3) / 4;

const HERO_IMAGES = {
  lateNight: require("../../../../assets/screens/late-night.png"),
  earlyMorning: require("../../../../assets/screens/early-morning.png"),
  morning: require("../../../../assets/screens/morning.png"),
  afternoon: require("../../../../assets/screens/afternoon.png"),
  evening: require("../../../../assets/screens/evening.png"),
  night: require("../../../../assets/screens/night.png"),
};

interface TimeHero {
  greeting: string;
  source: ImageSourcePropType;
}

// Helper components

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  progress: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color, progress }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconWrap}>{icon}</View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statSubtext, { color }]}>{subtext}</Text>
    <View style={styles.statBarTrack}>
      <View style={[styles.statBarFill, { backgroundColor: color, width: `${Math.round(progress * 100)}%` }]} />
    </View>
  </View>
);

interface ScheduleItemProps {
  time?: string;
  title: string;
  category?: string;
  categoryColor?: string;
  isLast?: boolean;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  time,
  title,
  category,
  categoryColor,
  isLast,
}) => (
  <View style={styles.scheduleRow}>
    <View style={styles.scheduleTimeCol}>
      {time ? (
        <>
          <Text style={styles.scheduleTime}>{time}</Text>
          <Text style={styles.scheduleAmPm} />
        </>
      ) : (
        <Text style={styles.scheduleTime}>Anytime</Text>
      )}
    </View>
    <View style={styles.scheduleConnector}>
      <View style={[styles.scheduleDot, { backgroundColor: categoryColor || theme.colors.primary }]} />
      {!isLast && <View style={styles.scheduleLine} />}
    </View>
    <View style={styles.scheduleContent}>
      <Text style={styles.scheduleTitle} numberOfLines={1}>
        {title}
      </Text>
      {category ? (
        <View style={[styles.scheduleBadge, { backgroundColor: `${categoryColor}15` }]}>
          <Text style={[styles.scheduleBadgeText, { color: categoryColor }]}>{category}</Text>
        </View>
      ) : null}
    </View>
    <AppIcon name={icons.calendar} size={18} color={theme.colors.textMuted} />
  </View>
);

interface PriorityTaskRowProps {
  task: CockpitTask;
  onToggle: () => void;
  categoryName?: string;
  categoryColor?: string;
}

const PriorityTaskRow: React.FC<PriorityTaskRowProps> = ({
  task,
  onToggle,
  categoryName,
  categoryColor,
}) => {
  const isDone = task.status === "done";
  const resolvedCategoryColor = categoryColor || theme.colors.primary;
  const priorityColor =
    task.priority === "urgent"
      ? theme.colors.danger
      : task.priority === "high"
      ? theme.colors.warning
      : task.priority === "medium"
      ? theme.colors.primary
      : theme.colors.textMuted;

  return (
    <TouchableOpacity
      style={styles.priorityRow}
      onPress={onToggle}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Toggle task ${task.title}`}
    >
      <View style={[styles.priorityCheckbox, isDone && styles.priorityCheckboxDone]}>
        {isDone ? (
          <AppIcon name={icons.check} size={14} color="#FFF" />
        ) : (
          <View style={styles.priorityCheckboxEmpty} />
        )}
      </View>

      <View style={styles.priorityContent}>
        <Text style={[styles.priorityTitle, isDone && styles.priorityTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.priorityMeta}>
          {categoryName ? (
            <View style={[styles.priorityBadge, { backgroundColor: `${resolvedCategoryColor}15` }]}>
              <Text style={[styles.priorityBadgeText, { color: resolvedCategoryColor }]}>{categoryName}</Text>
            </View>
          ) : null}
          {task.dueDate ? (
            <View style={styles.priorityDue}>
              <AppIcon name={icons.calendar} size={12} color={theme.colors.textSecondary} />
              <Text style={styles.priorityDueText}>{formatDueDate(task.dueDate)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <AppIcon
        name={icons.flag}
        size={18}
        color={priorityColor}
      />
    </TouchableOpacity>
  );
};

// Helpers

function getTimeHero(date = new Date()): TimeHero {
  const hour = date.getHours();
  if (hour < 5) return { greeting: "Late night", source: HERO_IMAGES.lateNight };
  if (hour < 8) return { greeting: "Early morning", source: HERO_IMAGES.earlyMorning };
  if (hour < 12) return { greeting: "Good morning", source: HERO_IMAGES.morning };
  if (hour < 17) return { greeting: "Good afternoon", source: HERO_IMAGES.afternoon };
  if (hour < 20) return { greeting: "Good evening", source: HERO_IMAGES.evening };
  return { greeting: "Good night", source: HERO_IMAGES.night };
}

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function formatCockpitDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDueDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isBeforeToday(dateStr: string): boolean {
  const d = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

// Main screen

const DailyCockpitScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TodayStackParamList>>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useCockpit();
  const updateTask = useUpdateTask();

  const { refreshControl } = useRefreshControl({ refetch });

  const habits = data?.habits ?? [];
  const tasks = data?.tasks ?? [];

  // Derived stats
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const overdueTasks = tasks.filter((t) => t.status !== "done" && t.dueDate && isBeforeToday(t.dueDate)).length;
    const completedRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const inProgressRate = totalTasks > 0 ? inProgressTasks / totalTasks : 0;
    const overdueRate = totalTasks > 0 ? overdueTasks / totalTasks : 0;
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completedRate: clampProgress(completedRate),
      inProgressRate: clampProgress(inProgressRate),
      overdueRate: clampProgress(overdueRate),
    };
  }, [tasks]);

  const atRiskHabits = useMemo(
    () => habits.filter((h) => !h.completedToday && h.currentStreak >= 3),
    [habits]
  );

  // Focus task
  const focusTask = useMemo(() => {
    const incomplete = tasks.filter((t) => t.status !== "done");
    if (incomplete.length === 0) return null;
    const urgent = incomplete.find((t) => t.priority === "urgent");
    if (urgent) return urgent;
    const high = incomplete.find((t) => t.priority === "high");
    if (high) return high;
    return incomplete[0];
  }, [tasks]);

  // Priority tasks sorted
  const priorityTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...tasks]
      .filter((t) => t.status !== "done")
      .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
      .slice(0, 3);
  }, [tasks]);

  const hero = getTimeHero();

  // Handlers
  const handleTaskToggle = useCallback(
    (task: CockpitTask) => {
      const newStatus = task.status === "done" ? "todo" : "done";
      updateTask.mutate(
        { id: task.id, payload: { status: newStatus } },
        { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to update task")) }
      );
    },
    [updateTask]
  );

  if (isLoading) return <LoadingSpinner message="Loading today's plan..." />;

  if (isError) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <EmptyState icon="warning" title="Couldn't load cockpit" subtitle="Pull down to retry" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <LoadingSpinner message="Preparing cockpit..." />
      </View>
    );
  }

  const todayDateStr = formatCockpitDate(data.date);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} accessibilityRole="button">
            <AppIcon name={icons.menu} size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Daily Cockpit</Text>
            <Text style={styles.headerDate}>{todayDateStr}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} accessibilityRole="button">
              <AppIcon name={icons.bell} size={22} color={theme.colors.textPrimary} />
              {atRiskHabits.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {atRiskHabits.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <AppIcon name={icons.user} size={18} color={theme.colors.primary} />
            </View>
          </View>
        </View>

        {/* Hero Greeting */}
        <ImageBackground
          source={hero.source}
          style={styles.heroCard}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroGreeting}>{hero.greeting}</Text>
            <Text style={styles.heroSub}>You've got focus, you've got this.</Text>
          </View>
        </ImageBackground>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<AppIcon name={icons.clipboard} size={20} color={theme.colors.primary} />}
            label="Tasks Today"
            value={stats.totalTasks}
            subtext={`${stats.completedTasks} done`}
            color={theme.colors.primary}
            progress={stats.completedRate}
          />
          <StatCard
            icon={<AppIcon name={icons.checkCircle} size={20} color={theme.colors.success} />}
            label="Completed"
            value={stats.completedTasks}
            subtext={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
            color={theme.colors.success}
            progress={stats.completedRate}
          />
          <StatCard
            icon={<AppIcon name={icons.clock} size={20} color={theme.colors.warning} />}
            label="In Progress"
            value={stats.inProgressTasks}
            subtext={`${stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0}%`}
            color={theme.colors.warning}
            progress={stats.inProgressRate}
          />
          <StatCard
            icon={<AppIcon name={icons.calendar} size={20} color={theme.colors.danger} />}
            label="Overdue"
            value={stats.overdueTasks}
            subtext={`${stats.overdueTasks} tasks`}
            color={theme.colors.danger}
            progress={stats.overdueRate}
          />
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate("TaskList")}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleCard}>
            {tasks.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Nothing scheduled"
                subtitle="Add tasks to see your daily schedule"
              />
            ) : (
              tasks.slice(0, 4).map((task, idx) => (
                <ScheduleItem
                  key={task.id}
                  title={task.title}
                  categoryColor={
                    task.priority === "urgent"
                      ? theme.colors.danger
                      : task.priority === "high"
                      ? theme.colors.warning
                      : task.priority === "medium"
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                  isLast={idx === Math.min(tasks.length, 4) - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* Priority Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Priority Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate("TaskList")}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priorityCard}>
            {priorityTasks.length === 0 ? (
              <EmptyState
                icon="check"
                title="All caught up"
                subtitle="No priority tasks for today"
              />
            ) : (
              priorityTasks.map((task) => (
                <PriorityTaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => handleTaskToggle(task)}
                />
              ))
            )}
          </View>
        </View>

        {/* Focus of the Day */}
        <View style={styles.section}>
          <View style={styles.focusCard}>
            <View style={styles.focusIconWrap}>
              <AppIcon name={icons.target} size={28} color={theme.colors.success} />
            </View>
            <View style={styles.focusTextWrap}>
              <Text style={styles.focusLabel}>Focus of the day</Text>
              {focusTask ? (
                <Text style={styles.focusValue} numberOfLines={2}>
                  {focusTask.title}
                </Text>
              ) : (
                <Text style={styles.focusValue}>
                  Small steps today, big progress tomorrow.
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bottom padding for scroll */}
        <View style={{ height: insets.bottom + theme.spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  headerDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  /* Hero */
  heroCard: {
    marginHorizontal: theme.spacing.lg,
    minHeight: 128,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: theme.borderRadius.xl,
  },
  heroTextWrap: {
    width: "62%",
  },
  heroGreeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  heroSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    ...theme.shadow,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  statSubtext: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  statBarTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  /* Section */
  section: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  sectionAction: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
  },

  /* Schedule */
  scheduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.sm,
  },
  scheduleTimeCol: {
    width: 50,
    alignItems: "flex-start",
  },
  scheduleTime: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  scheduleAmPm: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  scheduleConnector: {
    width: 24,
    alignItems: "center",
    marginHorizontal: theme.spacing.sm,
  },
  scheduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  scheduleLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: 2,
    minHeight: 24,
  },
  scheduleContent: {
    flex: 1,
    paddingBottom: theme.spacing.sm,
  },
  scheduleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  scheduleBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  scheduleBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },

  /* Priority */
  priorityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  priorityCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  priorityCheckboxDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  priorityCheckboxEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  priorityTitleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  priorityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  priorityBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },
  priorityDue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityDueText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },

  /* Focus */
  focusCard: {
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadow,
  },
  focusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.success}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  focusTextWrap: {
    flex: 1,
  },
  focusLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: "600",
  },
  focusValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default DailyCockpitScreen;
