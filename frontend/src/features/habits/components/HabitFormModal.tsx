import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme, COLORS } from "../../../theme/theme";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import CategoryChip from "../../categories/components/CategoryChip";
import { useCategories } from "../../categories/hooks/useCategories";
import { Habit, Category } from "../../../types";

interface HabitFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description?: string;
    categoryId?: string | null;
    recurrenceRule?: string;
    color?: string;
  }) => Promise<void>;
  editingHabit?: Habit | null;
  saving?: boolean;
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({
  visible,
  onClose,
  onSave,
  editingHabit,
  saving = false,
}) => {
  const { data: categories } = useCategories();

  const [title, setTitle] = useState(editingHabit?.title || "");
  const [description, setDescription] = useState(editingHabit?.description || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(editingHabit?.categoryId || null);
  const [selectedColor, setSelectedColor] = useState(editingHabit?.color || theme.colors.primary);

  const isEditing = !!editingHabit;

  useEffect(() => {
    if (visible) {
      setTitle(editingHabit?.title || "");
      setDescription(editingHabit?.description || "");
      setSelectedCategoryId(editingHabit?.categoryId || null);
      setSelectedColor(editingHabit?.color || theme.colors.primary);
    }
  }, [visible, editingHabit]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a habit name");
      return;
    }
    await onSave({
      title: title.trim(),
      description: description.trim(),
      categoryId: selectedCategoryId,
      ...(isEditing ? { recurrenceRule: editingHabit?.recurrenceRule } : {}),
      color: selectedColor,
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title={isEditing ? "Edit Habit" : "New Habit"}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Morning meditation"
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={!isEditing}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="What does this habit involve?"
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={styles.label}>Category (optional)</Text>
      <View style={styles.chipRow}>
        {categories?.map((cat: Category) => (
          <CategoryChip
            key={cat.id}
            category={cat}
            selected={selectedCategoryId === cat.id}
            onPress={() =>
              setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)
            }
          />
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              selectedColor === c && styles.colorDotSelected,
            ]}
            onPress={() => setSelectedColor(c)}
          />
        ))}
      </View>

      <View style={styles.modalActions}>
        <Button title="Cancel" variant="ghost" onPress={onClose} />
        <Button title={isEditing ? "Save Changes" : "Create Habit"} onPress={handleSave} loading={saving} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: theme.spacing.sm },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: theme.colors.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
});

export default HabitFormModal;
