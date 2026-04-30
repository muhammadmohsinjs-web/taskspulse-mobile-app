import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { formatShortDate } from "../../../utils/date";
import ProgressBar from "../../../components/ui/ProgressBar";
import { Goal } from "../../../types/goal";

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onLongPress?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onLongPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
      <Text style={styles.taskCount}>
        {goal.completedTasks}/{goal.totalTasks} tasks
      </Text>
    </View>
    {goal.description ? (
      <Text style={styles.description} numberOfLines={2}>{goal.description}</Text>
    ) : null}
    <View style={styles.progressSection}>
      <ProgressBar progress={goal.progress} color={goal.color} height={6} />
      <Text style={styles.percent}>{Math.round(goal.progress * 100)}%</Text>
    </View>
    {goal.targetDate ? (
      <Text style={styles.targetDate}>Target: {formatShortDate(goal.targetDate)}</Text>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  taskCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  percent: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: "500",
    minWidth: 32,
    textAlign: "right",
  },
  targetDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});

export default GoalCard;
