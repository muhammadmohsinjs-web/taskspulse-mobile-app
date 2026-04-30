import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = theme.colors.primary, height = 8 }) => {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: theme.borderRadius.full },
});

export default ProgressBar;
