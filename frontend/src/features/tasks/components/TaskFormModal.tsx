import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../../theme/theme";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { Task, TaskCreatePayload, Goal } from "../../../types";
import { useGoals } from "../../goals/hooks/useGoals";

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: TaskCreatePayload) => Promise<void>;
  editingTask?: Task | null;
  saving?: boolean;
  /** If provided, pre-select this goal for linking */
  preselectedGoalId?: string | null;
  /** If true, show goal picker for linking existing task */
  showGoalPicker?: boolean;
  onLinkToGoal?: (goalId: string) => Promise<void>;
  linking?: boolean;
}

const STATUS_OPTIONS = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
] as const;

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSave,
  editingTask,
  saving = false,
  preselectedGoalId,
  showGoalPicker = false,
  onLinkToGoal,
  linking = false,
}) => {
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">(editingTask?.status || "todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">(editingTask?.priority || "medium");
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || "");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(preselectedGoalId || null);

  const { data: goals } = useGoals();

  React.useEffect(() => {
    if (visible) {
      setTitle(editingTask?.title || "");
      setDescription(editingTask?.description || "");
      setStatus(editingTask?.status || "todo");
      setPriority(editingTask?.priority || "medium");
      setDueDate(editingTask?.dueDate || "");
      setSelectedGoalId(preselectedGoalId || null);
    }
  }, [visible, editingTask, preselectedGoalId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a task title");
      return;
    }
    await onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate.trim() || null,
    });
    if (editingTask && selectedGoalId && onLinkToGoal) {
      await onLinkToGoal(selectedGoalId);
    }
  };

  const isEditing = !!editingTask;

  return (
    <Modal visible={visible} onClose={onClose} title={isEditing ? "Edit Task" : "New Task"}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Review contract"
        placeholderTextColor={theme.colors.textMuted}
        autoFocus={!isEditing}
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Add details..."
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.optionRow}>
        {PRIORITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionChip,
              priority === opt.value && styles.optionChipSelected,
            ]}
            onPress={() => setPriority(opt.value)}
          >
            <Text
              style={[
                styles.optionChipText,
                priority === opt.value && styles.optionChipTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.optionRow}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionChip,
              status === opt.value && styles.optionChipSelected,
            ]}
            onPress={() => setStatus(opt.value)}
          >
            <Text
              style={[
                styles.optionChipText,
                status === opt.value && styles.optionChipTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Due Date (YYYY-MM-DD, optional)</Text>
      <TextInput
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="e.g. 2026-05-15"
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="numbers-and-punctuation"
      />

      {showGoalPicker && goals && goals.length > 0 && (
        <>
          <Text style={styles.label}>
            {editingTask ? "Link to Goal (optional)" : "Goal"}
          </Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionChip,
                !selectedGoalId && styles.optionChipSelected,
              ]}
              onPress={() => setSelectedGoalId(null)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  !selectedGoalId && styles.optionChipTextSelected,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>
            {goals.map((goal: Goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.optionChip,
                  selectedGoalId === goal.id && styles.optionChipSelected,
                  { borderColor: goal.color },
                ]}
                onPress={() => setSelectedGoalId(goal.id)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedGoalId === goal.id && styles.optionChipTextSelected,
                  ]}
                >
                  {goal.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.modalActions}>
        <Button title="Cancel" variant="ghost" onPress={onClose} />
        <Button
          title={isEditing ? "Save Changes" : "Create Task"}
          onPress={handleSave}
          loading={saving || linking}
        />
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
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  optionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  optionChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  optionChipTextSelected: {
    color: "#FFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
});

export default TaskFormModal;
