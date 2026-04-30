import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { Category } from "../../../types";

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected = false, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      { borderColor: category.color, backgroundColor: selected ? `${category.color}20` : "transparent" },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.text, { color: category.color }]}>{category.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
});

export default CategoryChip;
