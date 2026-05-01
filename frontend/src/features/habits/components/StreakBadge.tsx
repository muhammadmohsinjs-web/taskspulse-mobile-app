import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { AppIcon, icons } from "../../../components/ui/Icon";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ currentStreak, longestStreak }) => (
  <View style={styles.container}>
    <AppIcon name={icons.flame} size={24} color={theme.colors.streakActive} />
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
