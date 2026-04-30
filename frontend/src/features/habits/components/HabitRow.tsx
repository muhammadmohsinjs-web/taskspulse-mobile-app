import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { Habit } from "../../../types";

interface HabitRowProps {
  habit: Pick<Habit, "id" | "title" | "description" | "completedToday" | "currentStreak" | "color">;
  onToggle: () => void;
  onLongPress?: () => void;
}

const HabitRow: React.FC<HabitRowProps> = ({ habit, onToggle, onLongPress }) => {
  const streakColor =
    habit.currentStreak >= 7 ? theme.colors.streakActive : theme.colors.streak;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      onLongPress={onLongPress}
      activeOpacity={0.6}
    >
      <View style={[styles.checkbox, habit.completedToday && styles.checkboxDone]}>
        <Text style={styles.checkmark}>{habit.completedToday ? "✓" : ""}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, habit.completedToday && styles.titleDone]}>
          {habit.title}
        </Text>
        {habit.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {habit.description}
          </Text>
        ) : null}
      </View>

      {habit.currentStreak > 0 && (
        <View style={styles.streakSection}>
          <Text style={[styles.streakText, { color: streakColor }]}>
            {habit.currentStreak}
          </Text>
          <Text style={[styles.streakIcon, { color: streakColor }]}>🔥</Text>
        </View>
      )}
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
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
  description: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  streakSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.spacing.sm,
  },
  streakText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    marginRight: 2,
  },
  streakIcon: {
    fontSize: 12,
  },
});

export default HabitRow;
