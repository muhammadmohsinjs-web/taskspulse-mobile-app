import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { formatShortDate } from "../../../utils/date";
import Badge from "../../../components/ui/Badge";
import { Task } from "../../../types";

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  onLongPress?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: theme.colors.textMuted,
  medium: theme.colors.primary,
  high: theme.colors.warning,
  urgent: theme.colors.danger,
};

const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle, onPress, onLongPress }) => {
  const isDone = task.status === "done";

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
    >
      <TouchableOpacity onPress={onToggle} style={styles.checkboxArea}>
        <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
          <Text style={styles.checkmark}>{isDone ? "✓" : ""}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          {task.priority !== "medium" && (
            <Badge label={task.priority} color={PRIORITY_COLORS[task.priority]} />
          )}
          {task.dueDate && (
            <Text style={styles.dueDate}>{formatShortDate(task.dueDate)}</Text>
          )}
          {isDone && (
            <Text style={styles.doneLabel}>Done</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
  },
  checkboxArea: {
    paddingRight: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  dueDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  doneLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: "500",
  },
});

export default TaskRow;
