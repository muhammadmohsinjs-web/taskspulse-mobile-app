import React, { useCallback, useMemo, useState } from "react";
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
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { TodayStackParamList, RootTabParamList } from "../../../types";
import { useCockpit } from "../hooks/useCockpit";
import { useUpdateTask } from "../../tasks/hooks/useTasks";
import { useCreateTask } from "../../tasks/hooks/useTasks";
import { useToggleHabit } from "../../habits/hooks/useHabits";
import { useGoals } from "../../goals/hooks/useGoals";
import { useCategories } from "../../categories/hooks/useCategories";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import { CockpitTask, CockpitHabit, TaskCreatePayload, Category, Goal } from "../../../types";
import { AppIcon, icons, IconName } from "../../../components/ui/Icon";
import { FlameIcon } from "../../../components/ui/FlameIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DESIGN = {
  background: "#F7F9FD",
  primary: "#1477F8",
  text: "#070B25",
  muted: "#66708A",
  cardRadius: 18,
};

const HERO_IMAGES = {
  lateNight: require("../../../../assets/screens/late-night.png"),
  earlyMorning: require("../../../../assets/screens/early-morning.png"),
  morning: require("../../../../assets/screens/morning.png"),
  afternoon: require("../../../../assets/screens/afternoon.png"),
  evening: require("../../../../assets/screens/evening.png"),
  night: require("../../../../assets/screens/night.png"),
};

const GOAL_ICON_NAMES = [icons.rocket, icons.chartUp, icons.book, icons.goal];

const DISPLAY_NAME = "Mohsin";
const DISPLAY_INITIAL = "M";

interface TimeHero {
  greeting: string;
  source: ImageSourcePropType;
}

type DailyCockpitNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<TodayStackParamList, "Cockpit">,
  BottomTabNavigationProp<RootTabParamList>
>;

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

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function formatPercent(value: number): string {
  return `${Math.round(clampProgress(value) * 100)}%`;
}

function getTaskPriorityColor(priority: string): string {
  if (priority === "urgent") return theme.colors.danger;
  if (priority === "high") return theme.colors.warning;
  if (priority === "medium") return "#8B95A7";
  return theme.colors.textMuted;
}

function getDefaultCategoryLabel(type: "habit" | "task"): string {
  return type === "habit" ? "Habit" : "Task";
}

function formatTaskMetaDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  return formatDueDate(dateStr);
}

// Local Components

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = DESIGN.primary,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampProgress(progress));

  return (
    <View style={styles.progressRingContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8EBF1"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressRingCenter}>
        <Text style={styles.progressRingPercent}>{formatPercent(progress)}</Text>
        <Text style={styles.progressRingLabel}>Overall Progress</Text>
      </View>
    </View>
  );
};

interface SummaryMetricProps {
  iconName: IconName;
  label: string;
  value: string;
  color: string;
  progress: number;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({ iconName, label, value, color, progress }) => (
  <View style={styles.metricColumn}>
    <View style={[styles.metricIconWrap, { backgroundColor: `${color}15` }]}>
      <AppIcon name={iconName} size={18} color={color} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <View style={styles.metricBarTrack}>
      <View style={[styles.metricBarFill, { backgroundColor: color, width: `${Math.round(clampProgress(progress) * 100)}%` }]} />
    </View>
  </View>
);

interface StreakPillProps {
  days: number;
}

const StreakPill: React.FC<StreakPillProps> = ({ days }) => (
  <View style={styles.streakPill}>
    <FlameIcon size={16} />
    <Text style={styles.streakPillValue}>{days} days</Text>
    <Text style={styles.streakPillLabel}>Current Streak</Text>
  </View>
);

interface AtRiskBannerProps {
  count: number;
  onPress: () => void;
}

const AtRiskBanner: React.FC<AtRiskBannerProps> = ({ count, onPress }) => (
  <TouchableOpacity style={styles.atRiskBanner} onPress={onPress} activeOpacity={0.7}>
    <AppIcon name={icons.warning} size={20} color={theme.colors.warning} />
    <Text style={styles.atRiskText}>
      {count > 0 ? `${count} habits at risk today` : "No habits at risk today"}
    </Text>
    <AppIcon name={icons.chevron} size={16} color={theme.colors.warning} />
  </TouchableOpacity>
);

interface CockpitHabitRowProps {
  habit: CockpitHabit;
  category?: Category;
  isAtRisk: boolean;
  isLast: boolean;
  onToggle: () => void;
}

const CockpitHabitRow: React.FC<CockpitHabitRowProps> = ({ habit, category, isAtRisk, isLast, onToggle }) => {
  const streakColor = habit.currentStreak >= 7 ? theme.colors.streakActive : theme.colors.streak;

  return (
    <TouchableOpacity
      style={[styles.cockpitRow, !isLast && styles.cockpitRowBorder]}
      onPress={onToggle}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Toggle habit ${habit.title}`}
    >
      <View style={[styles.checkboxCircle, habit.completedToday && styles.checkboxCircleDone]}>
        {habit.completedToday ? (
          <AppIcon name={icons.check} size={12} color="#FFF" />
        ) : (
          <View style={styles.checkboxCircleEmpty} />
        )}
      </View>

      <View style={styles.cockpitRowContent}>
        <Text style={[styles.cockpitRowTitle, habit.completedToday && styles.cockpitRowTitleDone]} numberOfLines={1}>
          {habit.title}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryBadgeText, { color: category?.color || theme.colors.primary }]}>
            {category?.name || getDefaultCategoryLabel("habit")}
          </Text>
        </View>
      </View>

      <View style={styles.cockpitRowRight}>
        {habit.currentStreak > 0 && (
          <View style={styles.streakWrap}>
            <Text style={[styles.streakNumber, { color: streakColor }]}>{habit.currentStreak}</Text>
            <FlameIcon size={14} />
          </View>
        )}
        {isAtRisk && <View style={styles.atRiskDot} />}
      </View>
    </TouchableOpacity>
  );
};

interface CockpitTaskRowProps {
  task: CockpitTask;
  category?: Category;
  isLast: boolean;
  onToggle: () => void;
}

const CockpitTaskRow: React.FC<CockpitTaskRowProps> = ({ task, category, isLast, onToggle }) => {
  const isDone = task.status === "done";
  const priorityColor = getTaskPriorityColor(task.priority);

  return (
    <TouchableOpacity
      style={[styles.cockpitRow, !isLast && styles.cockpitRowBorder]}
      onPress={onToggle}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Toggle task ${task.title}`}
    >
      <View style={[styles.checkboxCircle, isDone && styles.checkboxCircleDone]}>
        {isDone ? (
          <AppIcon name={icons.check} size={12} color="#FFF" />
        ) : (
          <View style={styles.checkboxCircleEmpty} />
        )}
      </View>

      <View style={styles.cockpitRowContent}>
        <Text style={[styles.cockpitRowTitle, isDone && styles.cockpitRowTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.taskMetaRow}>
          <AppIcon name={icons.calendar} size={12} color={theme.colors.textSecondary} />
          <Text style={styles.taskMetaText}>{formatTaskMetaDate(task.dueDate)}</Text>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: `${category.color}15` }]}>
              <Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.name}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
    </TouchableOpacity>
  );
};

interface GoalPreviewCardProps {
  goal: Goal;
  iconName: IconName;
  onPress: () => void;
}

const GoalPreviewCard: React.FC<GoalPreviewCardProps> = ({ goal, iconName, onPress }) => (
  <TouchableOpacity style={styles.goalPreviewCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.goalPreviewIconWrap, { backgroundColor: `${goal.color}15` }]}>
      <AppIcon name={iconName} size={20} color={goal.color} />
    </View>
    <Text style={styles.goalPreviewTitle} numberOfLines={1}>{goal.title}</Text>
    <View style={styles.goalPreviewProgressRow}>
      <View style={styles.goalPreviewBarTrack}>
        <View style={[styles.goalPreviewBarFill, { backgroundColor: goal.color, width: `${Math.round(clampProgress(goal.progress) * 100)}%` }]} />
      </View>
      <Text style={[styles.goalPreviewPercent, { color: goal.color }]}>{formatPercent(goal.progress)}</Text>
    </View>
  </TouchableOpacity>
);

// Main Screen

const DailyCockpitScreen: React.FC = () => {
  const navigation = useNavigation<DailyCockpitNavProp>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useCockpit();
  const { data: categories } = useCategories();
  const { data: goals, isError: isGoalsError, isLoading: isGoalsLoading } = useGoals();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const toggleHabit = useToggleHabit();

  const { refreshControl } = useRefreshControl({ refetch });

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const closeTaskModal = useCallback(() => {
    setTaskModalVisible(false);
  }, []);

  const handleCreateTask = useCallback(
    async (payload: TaskCreatePayload) => {
      setSavingTask(true);
      try {
        await createTask.mutateAsync(payload);
        closeTaskModal();
      } catch (e: unknown) {
        Alert.alert("Error", getErrorMessage(e, "Failed to create task"));
      } finally {
        setSavingTask(false);
      }
    },
    [createTask, closeTaskModal]
  );

  const habits = data?.habits ?? [];
  const tasks = data?.tasks ?? [];

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    categories?.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  const habitRate = habits.length > 0
    ? habits.filter((h) => h.completedToday).length / habits.length
    : 0;

  const taskRate = tasks.length > 0
    ? tasks.filter((t) => t.status === "done").length / tasks.length
    : 0;

  const goalRate = goals && goals.length > 0
    ? goals.reduce((sum, g) => sum + clampProgress(g.progress), 0) / goals.length
    : 0;

  const progressParts = [
    habits.length > 0 ? habitRate : null,
    tasks.length > 0 ? taskRate : null,
    goals && goals.length > 0 ? goalRate : null,
  ].filter((value): value is number => value !== null);

  const overallRate = progressParts.length > 0
    ? progressParts.reduce((sum, value) => sum + value, 0) / progressParts.length
    : 0;

  const currentStreakDays = habits.length > 0
    ? Math.max(...habits.map((h) => h.currentStreak), 0)
    : 0;

  const atRiskHabits = habits.filter(
    (h) => !h.completedToday && h.currentStreak >= 3
  );
  const atRiskCount = atRiskHabits.length;

  const visibleHabits = habits.slice(0, 5);
  const visibleTasks = tasks.slice(0, 4);
  const visibleGoals = (goals ?? []).slice(0, 6);

  const hero = getTimeHero();

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

  const handleHabitToggle = useCallback(
    (habit: CockpitHabit) => {
      toggleHabit.mutate(
        { id: habit.id, completedToday: habit.completedToday },
        { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to update habit")) }
      );
    },
    [toggleHabit]
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
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerDate}>{todayDateStr}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <AppIcon name={icons.bell} size={22} color={theme.colors.textPrimary} />
              {atRiskCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{atRiskCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{DISPLAY_INITIAL}</Text>
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
          <View style={styles.heroOverlay}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroGreeting}>
                {hero.greeting}, {DISPLAY_NAME} 👋
              </Text>
              <Text style={styles.heroSub}>Let's protect your streak today</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <StreakPill days={currentStreakDays} />
          </View>
          <View style={styles.summaryContent}>
            <CircularProgress progress={overallRate} />
            <View style={styles.metricsRow}>
              <SummaryMetric
                iconName={icons.checkCircle}
                label="Habits"
                value={formatPercent(habitRate)}
                color={theme.colors.success}
                progress={habitRate}
              />
              <SummaryMetric
                iconName={icons.list}
                label="Tasks"
                value={formatPercent(taskRate)}
                color={DESIGN.primary}
                progress={taskRate}
              />
              <SummaryMetric
                iconName={icons.target}
                label="Goals"
                value={formatPercent(goalRate)}
                color="#7C5CE6"
                progress={goalRate}
              />
            </View>
          </View>
        </View>

        {/* At Risk Banner */}
        <AtRiskBanner
          count={atRiskCount}
          onPress={() => navigation.navigate("HabitsList")}
        />

        {/* Habits Card */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderInline}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <TouchableOpacity onPress={() => navigation.navigate("HabitsList")}>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.screenCard}>
            {visibleHabits.length === 0 ? (
              <EmptyState
                icon="sprout"
                title="No habits yet"
                subtitle="Create habits to protect your streak"
              />
            ) : (
              visibleHabits.map((habit, idx) => (
                <CockpitHabitRow
                  key={habit.id}
                  habit={habit}
                  category={habit.categoryId ? categoryById.get(habit.categoryId) : undefined}
                  isAtRisk={atRiskHabits.some((h) => h.id === habit.id)}
                  isLast={idx === visibleHabits.length - 1}
                  onToggle={() => handleHabitToggle(habit)}
                />
              ))
            )}
          </View>
        </View>

        {/* Tasks Card */}
        <View style={styles.tasksCardWrap}>
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderInline}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate("TaskList")}>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.screenCard}>
              {visibleTasks.length === 0 ? (
                <EmptyState
                  icon="edit"
                  title="No tasks today"
                  subtitle="Add tasks to see your daily plan"
                />
              ) : (
                visibleTasks.map((task, idx) => (
                  <CockpitTaskRow
                    key={task.id}
                    task={task}
                    category={task.categoryId ? categoryById.get(task.categoryId) : undefined}
                    isLast={idx === visibleTasks.length - 1}
                    onToggle={() => handleTaskToggle(task)}
                  />
                ))
              )}
            </View>
          </View>
        </View>

        {/* Goals Carousel */}
        <View style={styles.goalsSection}>
          <View style={styles.goalsHeader}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <TouchableOpacity
              onPress={() =>
                (navigation as any).navigate("Goals", { screen: "GoalsList" })
              }
            >
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>

          {isGoalsLoading ? (
            <LoadingSpinner message="Loading goals..." />
          ) : isGoalsError ? (
            <EmptyState icon="warning" title="Couldn't load goals" subtitle="Pull down to retry" />
          ) : visibleGoals.length === 0 ? (
            <EmptyState icon="target" title="No active goals" subtitle="Create a goal to track progress" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {visibleGoals.map((goal, idx) => (
                <GoalPreviewCard
                  key={goal.id}
                  goal={goal}
                  iconName={GOAL_ICON_NAMES[idx % GOAL_ICON_NAMES.length]}
                  onPress={() =>
                    (navigation as any).navigate("Goals", {
                      screen: "GoalDetail",
                      params: { goalId: goal.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: insets.bottom + 96 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.cockpitFab}
        onPress={() => setTaskModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add task"
      >
        <AppIcon name={icons.plus} size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Task Create Modal */}
      <TaskFormModal
        visible={taskModalVisible}
        onClose={closeTaskModal}
        onSave={handleCreateTask}
        saving={savingTask}
      />
    </View>
  );
};

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: DESIGN.text,
    letterSpacing: -1,
  },
  headerDate: {
    fontSize: 16,
    color: DESIGN.muted,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow,
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
  avatarInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  // Hero
  heroCard: {
    marginHorizontal: theme.spacing.xl,
    minHeight: 104,
    borderRadius: DESIGN.cardRadius,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: DESIGN.cardRadius,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: DESIGN.cardRadius,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  heroTextWrap: {
    width: "62%",
  },
  heroGreeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSub: {
    fontSize: theme.fontSize.sm,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: DESIGN.cardRadius,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5EA",
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: 4,
  },
  streakPillValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: "#FB8C00",
  },
  streakPillLabel: {
    fontSize: theme.fontSize.xs,
    color: "#FB8C00",
    opacity: 0.8,
  },
  summaryHeaderRow: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  // Circular Progress
  progressRingContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRingCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressRingPercent: {
    fontSize: 28,
    fontWeight: "800",
    color: DESIGN.text,
  },
  progressRingLabel: {
    fontSize: theme.fontSize.xs,
    color: DESIGN.muted,
    marginTop: 2,
  },

  // Metrics
  metricsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: theme.spacing.md,
  },
  metricColumn: {
    alignItems: "center",
    flex: 1,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: theme.fontSize.xs,
    color: DESIGN.muted,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    marginTop: 2,
  },
  metricBarTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
    width: "100%",
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  // At Risk Banner
  atRiskBanner: {
    marginHorizontal: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#FFE4C2",
  },
  atRiskText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.warning,
  },

  // Card Section
  cardSection: {
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionHeaderInline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: DESIGN.text,
  },
  sectionAction: {
    fontSize: theme.fontSize.sm,
    color: DESIGN.primary,
    fontWeight: "600",
  },
  screenCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: DESIGN.cardRadius,
    padding: theme.spacing.lg,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  // Cockpit Rows
  cockpitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  cockpitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DESIGN.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  checkboxCircleDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkboxCircleEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
  },
  cockpitRowContent: {
    flex: 1,
  },
  cockpitRowTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: DESIGN.text,
  },
  cockpitRowTitleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },
  cockpitRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  streakWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  streakNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  atRiskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
  },

  // Task Meta
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  taskMetaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: theme.spacing.sm,
  },

  // Tasks Card Wrap with FAB
  tasksCardWrap: {
    marginBottom: theme.spacing.lg,
  },
  cockpitFab: {
    position: "absolute",
    bottom: theme.spacing.xxl,
    right: theme.spacing.xl + 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DESIGN.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },

  // Goals Section
  goalsSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  goalPreviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: DESIGN.cardRadius,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.md,
    width: Math.min(230, SCREEN_WIDTH * 0.34),
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  goalPreviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  goalPreviewTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: DESIGN.text,
    marginBottom: theme.spacing.sm,
  },
  goalPreviewProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  goalPreviewBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  goalPreviewBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  goalPreviewPercent: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "right",
  },
});

export default DailyCockpitScreen;
