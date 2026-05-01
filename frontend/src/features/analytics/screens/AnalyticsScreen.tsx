import React from "react";
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
import { useAnalyticsSummary, useHeatmap } from "../../analytics/hooks/useAnalytics";
import ProgressBar from "../../../components/ui/ProgressBar";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import CalendarHeatmap from "../../calendar/components/CalendarHeatmap";
import { MoreStackParamList } from "../../../types";

type AnalyticsNavProp = NativeStackNavigationProp<MoreStackParamList, "Analytics">;

const HABIT_BAR_COLOR = (rate: number) => {
  if (rate >= 80) return theme.colors.success;
  if (rate >= 50) return theme.colors.warning;
  return theme.colors.danger;
};

const BAR_COLORS = ["#4A90D9", "#10B981"];

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsNavProp>();
  const { data: summary, isLoading, isError, refetch } = useAnalyticsSummary();
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(3);
  const { refreshControl } = useRefreshControl({ refetch });

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />;

  if (isError || !summary) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="warning" title="Couldn't load analytics" subtitle="Pull down to retry" />
      </View>
    );
  }

  const { habitBars, topStreaks, goalProgress, taskTrends, categoryDistribution } = summary;
  const maxBarValue = Math.max(...habitBars.map((b) => b.completionRate), 1);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Habit Consistency */}
        <Text style={styles.sectionTitle}>Habit Consistency</Text>
        <Card>
          <Text style={styles.cardSubtitle}>
            {summary.habitCompletionRate7d}% avg · {summary.totalHabits} habits
          </Text>

          {/* 7-day bar chart */}
          <View style={styles.barChart}>
            {habitBars.map((bar) => (
              <View key={bar.date} style={styles.barColumn}>
                <Text style={styles.barValue}>{bar.completionRate}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${(bar.completionRate / maxBarValue) * 100}%`,
                        backgroundColor: HABIT_BAR_COLOR(bar.completionRate),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>

          {/* Top streaks */}
          {topStreaks.length > 0 && (
            <View style={styles.streaksWrap}>
              <Text style={styles.subSectionTitle}>Top Streaks</Text>
              {topStreaks.slice(0, 3).map((s) => (
                <View key={s.habitId} style={styles.streakRow}>
                  <View style={[styles.streakDot, { backgroundColor: s.color }]} />
                  <Text style={styles.streakName} numberOfLines={1}>
                    {s.habitTitle}
                  </Text>
                  <Badge label={`${s.currentStreak} days`} color={theme.colors.streak} />
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Section 2: Task Trends */}
        <Text style={styles.sectionTitle}>Task Trends</Text>
        <Card>
          <Text style={styles.cardSubtitle}>Last 30 Days</Text>

          {/* Mini line chart - rendered as bars for simplicity */}
          <View style={styles.trendsChart}>
            {taskTrends.dailyCreated.slice(-14).map((val, i) => {
              const completed = taskTrends.dailyCompleted.slice(-14)[i];
              const maxTrend = Math.max(
                ...taskTrends.dailyCreated.slice(-14),
                ...taskTrends.dailyCompleted.slice(-14),
                1
              );
              return (
                <View key={i} style={styles.trendColumn}>
                  <View style={styles.trendBars}>
                    <View
                      style={[
                        styles.trendBar,
                        {
                          height: `${(val / maxTrend) * 100}%`,
                          backgroundColor: BAR_COLORS[0],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.trendBar,
                        {
                          height: `${(completed / maxTrend) * 100}%`,
                          backgroundColor: BAR_COLORS[1],
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: BAR_COLORS[0] }]} />
              <Text style={styles.legendText}>Created</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: BAR_COLORS[1] }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{taskTrends.last30DaysCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{taskTrends.completionRate}%</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{taskTrends.avgTasksPerDay}</Text>
              <Text style={styles.statLabel}>Avg/Day</Text>
            </View>
          </View>
        </Card>

        {/* Section 3: Goal Progress */}
        {goalProgress.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Goal Progress</Text>
            <Card>
              {goalProgress.map((g) => (
                <TouchableOpacity
                  key={g.goalId}
                  style={styles.goalRow}
                  activeOpacity={0.6}
                  onPress={() => navigation.navigate("GoalDetail", { goalId: g.goalId })}
                >
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName} numberOfLines={1}>
                      {g.goalTitle}
                    </Text>
                    <Text style={styles.goalPercent}>{g.progress}%</Text>
                  </View>
                  <ProgressBar
                    progress={g.progress / 100}
                    color={g.color || theme.colors.primary}
                    height={6}
                  />
                  <Text style={styles.goalMeta}>
                    {g.completedTasks}/{g.totalTasks} tasks
                  </Text>
                </TouchableOpacity>
              ))}
            </Card>
          </>
        )}

        {/* Section 4: Activity Heatmap */}
        <Text style={styles.sectionTitle}>Activity Heatmap</Text>
        <Card>
          {heatmapLoading ? (
            <LoadingSpinner message="Loading heatmap..." />
          ) : heatmap ? (
            <CalendarHeatmap data={heatmap} />
          ) : (
            <Text style={styles.emptyText}>No activity data yet</Text>
          )}
        </Card>

        {/* Section 5: Category Distribution */}
        {categoryDistribution.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Where Your Time Goes</Text>
            <Card>
              {categoryDistribution.map((c, i) => (
                <View key={i} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: c.color }]} />
                  <Text style={styles.catName} numberOfLines={1}>
                    {c.categoryName}
                  </Text>
                  <Text style={styles.catCount}>
                    {c.taskCount + c.habitCount} items
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  // Bar chart
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 120,
    marginBottom: theme.spacing.md,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 28,
    height: 80,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  // Streaks
  streaksWrap: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  subSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  streakName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  // Trends chart
  trendsChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 80,
    marginBottom: theme.spacing.sm,
  },
  trendColumn: {
    flex: 1,
    alignItems: "center",
  },
  trendBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 70,
    gap: 2,
  },
  trendBar: {
    width: 6,
    borderRadius: 2,
    minHeight: 1,
  },
  // Legend
  legend: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  // Stats row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Goals
  goalRow: {
    marginBottom: theme.spacing.md,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  goalPercent: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  goalMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Categories
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  catCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AnalyticsScreen;
