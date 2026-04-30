import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, color, bgColor }) => {
  const bg = bgColor || (color ? `${color}20` : `${theme.colors.primary}20`);
  const textColor = color || theme.colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },
});

export default Badge;
