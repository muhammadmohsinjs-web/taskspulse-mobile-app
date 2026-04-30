import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

interface FABProps {
  onPress: () => void;
  icon?: string;
  accessibilityLabel?: string;
}

const FAB: React.FC<FABProps> = ({ onPress, icon = "+", accessibilityLabel }) => (
  <TouchableOpacity
    style={styles.fab}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={accessibilityLabel || "Add"}
    accessibilityRole="button"
  >
    <Text style={styles.fabText}>{icon}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadow,
    elevation: 6,
  },
  fabText: { color: "#FFF", fontSize: 28, fontWeight: "300", marginTop: -2 },
});

export default FAB;
