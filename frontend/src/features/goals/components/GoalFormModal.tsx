import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme, COLORS } from "../../../theme/theme";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { isValidDateString } from "../../../utils/date";
import { Goal } from "../../../types";

interface GoalFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description?: string;
    targetDate?: string | null;
    color?: string;
  }) => Promise<void>;
  editingGoal?: Goal | null;
  saving?: boolean;
}

const GoalFormModal: React.FC<GoalFormModalProps> = ({
  visible,
  onClose,
  onSave,
  editingGoal,
  saving = false,
}) => {
  const [title, setTitle] = useState(editingGoal?.title || "");
  const [description, setDescription] = useState(editingGoal?.description || "");
  const [targetDate, setTargetDate] = useState(editingGoal?.targetDate || "");
  const [selectedColor, setSelectedColor] = useState(editingGoal?.color || theme.colors.primary);

  const isEditing = !!editingGoal;

  useEffect(() => {
    if (visible) {
      setTitle(editingGoal?.title || "");
      setDescription(editingGoal?.description || "");
      setTargetDate(editingGoal?.targetDate || "");
      setSelectedColor(editingGoal?.color || theme.colors.primary);
    }
  }, [visible, editingGoal]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a goal name");
      return;
    }
    if (!isValidDateString(targetDate)) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format");
      return;
    }
    await onSave({
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate.trim() || null,
      color: selectedColor,
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title={isEditing ? "Edit Goal" : "New Goal"}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Launch MVP"
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={!isEditing}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="What does success look like?"
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Target Date (YYYY-MM-DD, optional)</Text>
      <TextInput
        style={styles.input}
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder="e.g. 2026-06-01"
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="numbers-and-punctuation"
      />

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
        <Button title={isEditing ? "Save Changes" : "Create Goal"} onPress={handleSave} loading={saving} />
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
  multiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
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

export default GoalFormModal;
