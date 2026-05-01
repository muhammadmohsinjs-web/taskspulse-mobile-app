import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../../../theme/theme";

interface CalendarDayCellProps {
  day: number;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  taskCount: number;
  categoryColors: string[];
  onPress: (dateStr: string) => void;
}

const MAX_DOTS = 3;

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  dateStr,
  isToday,
  isCurrentMonth,
  taskCount,
  categoryColors,
  onPress,
}) => {
  const dotColors = categoryColors.slice(0, MAX_DOTS);
  const overflow = Math.max(0, taskCount - MAX_DOTS);

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isToday && styles.cellToday,
        !isCurrentMonth && styles.cellOtherMonth,
      ]}
      onPress={() => onPress(dateStr)}
      activeOpacity={0.6}
      accessibilityLabel={`${dateStr}, ${taskCount} tasks`}
    >
      <View style={[styles.dayNumberWrap, isToday && styles.dayNumberWrapToday]}>
        <Text
          style={[
            styles.dayNumber,
            !isCurrentMonth && styles.dayNumberMuted,
            isToday && styles.dayNumberToday,
          ]}
        >
          {day}
        </Text>
      </View>
      <View style={styles.dotsRow}>
        {dotColors.map((color, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
        ))}
        {overflow > 0 && (
          <Text style={styles.overflowText}>+{overflow}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
    borderRadius: theme.borderRadius.md,
    marginBottom: 2,
  },
  cellToday: {
    backgroundColor: `${theme.colors.primary}12`,
  },
  cellOtherMonth: {
    opacity: 0.35,
  },
  dayNumberWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  dayNumberWrapToday: {
    backgroundColor: theme.colors.primary,
  },
  dayNumber: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  dayNumberMuted: {
    color: theme.colors.textMuted,
  },
  dayNumberToday: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  overflowText: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
});

export default CalendarDayCell;
