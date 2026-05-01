import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable, Alert, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { theme } from "../../../theme/theme";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { Task, TaskCreatePayload, Goal, Category } from "../../../types";
import { useGoals } from "../../goals/hooks/useGoals";
import { useCategories } from "../../categories/hooks/useCategories";
import { AppIcon, icons } from "../../../components/ui/Icon";

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: TaskCreatePayload) => Promise<void>;
  editingTask?: Task | null;
  saving?: boolean;
  preselectedGoalId?: string | null;
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

const RECURRENCE_OPTIONS = [
  { label: "One-off", value: null },
  { label: "Daily", value: '{"type":"daily"}' },
  { label: "Weekly", value: '{"type":"weekly"}' },
  { label: "Monthly", value: '{"type":"monthly"}' },
  { label: "Yearly", value: '{"type":"yearly"}' },
];

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(editingTask?.categoryId || null);
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(editingTask?.recurrenceRule || null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(preselectedGoalId || null);

  const { data: goals } = useGoals();
  const { data: categories } = useCategories();

  // ── Date helpers ────────────────────────────────────────────────
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const getDateFromString = (dateString: string): Date => {
    if (dateString) {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      setDueDate(formatted);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleClearDate = () => {
    setDueDate("");
  };
  // ────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (visible) {
      setTitle(editingTask?.title || "");
      setDescription(editingTask?.description || "");
      setStatus(editingTask?.status || "todo");
      setPriority(editingTask?.priority || "medium");
      setDueDate(editingTask?.dueDate || "");
      setShowDatePicker(false);
      setSelectedCategoryId(editingTask?.categoryId || null);
      setRecurrenceRule(editingTask?.recurrenceRule || null);
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
      categoryId: selectedCategoryId,
      recurrenceRule,
    });
    if (editingTask && selectedGoalId && onLinkToGoal) {
      await onLinkToGoal(selectedGoalId);
    }
  };

  const isEditing = !!editingTask;

  // ── iOS Date Picker Overlay ─────────────────────────────────────
  const datePickerOverlay = showDatePicker && Platform.OS === "ios" ? (
    <View style={overlayStyles.container}>
      <Pressable style={overlayStyles.backdrop} onPress={handleDateCancel} />
      <View style={overlayStyles.card}>
        <Text style={overlayStyles.title}>Select Date</Text>
        <DateTimePicker
          value={getDateFromString(dueDate)}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
        <View style={overlayStyles.actions}>
          <Button title="Cancel" variant="ghost" onPress={handleDateCancel} />
          <Button title="Done" onPress={handleDateCancel} />
        </View>
      </View>
    </View>
  ) : null;
  // ────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} onClose={onClose} title={isEditing ? "Edit Task" : "New Task"} overlay={datePickerOverlay}>
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

      <Text style={styles.label}>Due Date (optional)</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
        accessibilityLabel="Select due date"
        accessibilityRole="button"
      >
        <AppIcon name={icons.calendar} size={18} color={theme.colors.textMuted} />
        <Text style={[dueDate ? styles.dateText : styles.datePlaceholder, { flex: 1 }]}>
          {dueDate ? formatDisplayDate(dueDate) : "Select a date"}
        </Text>
        {dueDate ? (
          <TouchableOpacity
            onPress={handleClearDate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Remove due date"
          >
            <Text style={styles.clearDate}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {/* Android native date dialog */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={getDateFromString(dueDate)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Recurrence (optional)</Text>
      <View style={styles.optionRow}>
        {RECURRENCE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.optionChip,
              recurrenceRule === opt.value && styles.optionChipSelected,
            ]}
            onPress={() => setRecurrenceRule(opt.value)}
          >
            <Text
              style={[
                styles.optionChipText,
                recurrenceRule === opt.value && styles.optionChipTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category (optional)</Text>
      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[
            styles.optionChip,
            !selectedCategoryId && styles.optionChipSelected,
          ]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text
            style={[
              styles.optionChipText,
              !selectedCategoryId && styles.optionChipTextSelected,
            ]}
          >
            None
          </Text>
        </TouchableOpacity>
        {categories?.map((cat: Category) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.optionChip,
              selectedCategoryId === cat.id && styles.optionChipSelected,
              selectedCategoryId === cat.id
                ? {}
                : { borderColor: cat.color },
            ]}
            onPress={() =>
              setSelectedCategoryId(
                selectedCategoryId === cat.id ? null : cat.id
              )
            }
          >
            <Text
              style={[
                styles.optionChipText,
                selectedCategoryId === cat.id && styles.optionChipTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  datePlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  clearDate: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    padding: 2,
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

// Overlay styles (iOS date picker)
const overlayStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  card: {
    width: "90%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    ...theme.shadow,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    width: "100%",
  },
});

export default TaskFormModal;
