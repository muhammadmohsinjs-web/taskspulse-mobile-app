import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ currentStreak, longestStreak }) => (
  <View style={styles.container}>
    <Text style={styles.fire}>🔥</Text>
    <Text style={styles.current}>{currentStreak}</Text>
    <Text style={styles.label}>day streak</Text>
    <Text style={styles.best}>
      Best: {longestStreak}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  fire: { fontSize: 24 },
  current: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    color: theme.colors.streakActive,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  best: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export default StreakBadge;
