import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import EmptyState from "../../../components/ui/EmptyState";

const TaskListScreen: React.FC = () => (
  <View style={styles.container}>
    <EmptyState icon="📝" title="Tasks" subtitle="Task management coming in Phase 2" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: "center" },
});

export default TaskListScreen;
