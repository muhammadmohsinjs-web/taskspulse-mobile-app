import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { HeatmapData } from "../../../types";

interface CalendarHeatmapProps {
  data: HeatmapData;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_SIZE = 14;
const CELL_MARGIN = 3;
const CELLS_PER_ROW = Math.floor((SCREEN_WIDTH - 32) / (CELL_SIZE + CELL_MARGIN));

const HEATMAP_COLORS = [
  "#ebedf0", // level 0 - empty
  "#c6e48b", // level 1 - light
  "#7bc96f", // level 2 - medium
  "#239a3b", // level 3 - dark
  "#196127", // level 4 - darkest
];

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const { days } = data;

  const rows = useMemo(() => {
    const result: typeof days[] = [];
    for (let i = 0; i < days.length; i += CELLS_PER_ROW) {
      result.push(days.slice(i, i + CELLS_PER_ROW));
    }
    return result;
  }, [days, CELLS_PER_ROW]);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((day) => (
            <View
              key={day.date}
              style={[
                styles.cell,
                { backgroundColor: HEATMAP_COLORS[day.level] || HEATMAP_COLORS[0] },
              ]}
            />
          ))}
        </View>
      ))}
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.cell, { backgroundColor: HEATMAP_COLORS[0] }]} />
          <View style={[styles.cell, { backgroundColor: HEATMAP_COLORS[1] }]} />
          <View style={[styles.cell, { backgroundColor: HEATMAP_COLORS[2] }]} />
          <View style={[styles.cell, { backgroundColor: HEATMAP_COLORS[3] }]} />
          <View style={[styles.cell, { backgroundColor: HEATMAP_COLORS[4] }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: CELL_MARGIN,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  legend: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: "row",
    gap: 4,
  },
});

export default CalendarHeatmap;
