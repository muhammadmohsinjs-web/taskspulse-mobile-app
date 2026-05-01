import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";
import { AppIcon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = "clipboard", title, subtitle }) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <AppIcon name={icon} size={48} color={theme.colors.textMuted} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  iconWrap: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});

export default EmptyState;
