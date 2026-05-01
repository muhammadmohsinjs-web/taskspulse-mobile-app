import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../../tasks/hooks/useTasks";
import TaskRow from "../../tasks/components/TaskRow";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { Task, TaskCreatePayload, TaskUpdatePayload } from "../../../types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
] as const;

type SortMode = "newest" | "priority";

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

const BacklogScreen: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);

  const { data: tasks, isLoading, isError, refetch } = useTasks({ isBacklog: true });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<Task | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const filteredTasks = useMemo(() => {
    let filtered = tasks || [];

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (showHighPriorityOnly) {
      filtered = filtered.filter((t) => t.priority === "high" || t.priority === "urgent");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (sortMode === "priority") {
      filtered = [...filtered].sort(
        (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
      );
    }

    return filtered;
  }, [tasks, statusFilter, showHighPriorityOnly, searchQuery, sortMode]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingTask(null);
  }, []);

  const handleSave = useCallback(
    async (payload: TaskCreatePayload) => {
      setSaving(true);
      try {
        if (editingTask) {
          await updateTask.mutateAsync({ id: editingTask.id, payload: payload as TaskUpdatePayload });
        } else {
          await createTask.mutateAsync(payload);
        }
        closeModal();
      } catch (e: unknown) {
        Alert.alert("Error", getErrorMessage(e, "Failed to save task"));
      } finally {
        setSaving(false);
      }
    },
    [editingTask, createTask, updateTask, closeModal]
  );

  const handleToggle = useCallback(
    (task: Task) => {
      const nextStatus = task.status === "done" ? "todo" : "done";
      updateTask.mutate(
        { id: task.id, payload: { status: nextStatus } },
        { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to update task")) }
      );
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteTask.mutate(id, {
              onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to delete task")),
            }),
        },
      ]);
    },
    [deleteTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  }, []);

  const handleSchedule = useCallback((task: Task) => {
    setScheduleTarget(task);
    setShowDatePicker(true);
  }, []);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (selectedDate && scheduleTarget) {
        const formatted = selectedDate.toISOString().split("T")[0];
        updateTask.mutate(
          { id: scheduleTarget.id, payload: { dueDate: formatted } },
          { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to schedule task")) }
        );
        setScheduleTarget(null);
      }
    },
    [scheduleTarget, updateTask]
  );

  const handleScheduleToday = useCallback(
    (task: Task) => {
      const today = new Date().toISOString().split("T")[0];
      updateTask.mutate(
        { id: task.id, payload: { dueDate: today } },
        { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to schedule task")) }
      );
    },
    [updateTask]
  );

  const isFriday = new Date().getDay() === 5;
  const backlogCount = tasks?.length || 0;
  const showWeekendPrompt = isFriday && backlogCount > 5;

  if (isLoading) return <LoadingSpinner message="Loading backlog..." />;

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search backlog..."
              placeholderTextColor={theme.colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sortBtn, sortMode === "priority" && styles.sortBtnActive]}
            onPress={() => setSortMode(sortMode === "newest" ? "priority" : "newest")}
          >
            <Text style={[styles.sortBtnText, sortMode === "priority" && styles.sortBtnTextActive]}>
              {sortMode === "newest" ? "↓" : "‼"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
              onPress={() => setStatusFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === f.value && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.filterChip, showHighPriorityOnly && styles.filterChipHighPriority]}
            onPress={() => setShowHighPriorityOnly(!showHighPriorityOnly)}
          >
            <Text
              style={[
                styles.filterChipText,
                showHighPriorityOnly && styles.filterChipTextActive,
              ]}
            >
              High Priority
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showWeekendPrompt && (
        <View style={styles.weekendPrompt}>
          <Text style={styles.weekendPromptText}>
            {backlogCount} tasks are waiting in your backlog. Time to plan your week!
          </Text>
        </View>
      )}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <View style={styles.taskRowWrapper}>
            <View style={styles.taskRowInner}>
              <TaskRow
                task={item}
                onToggle={() => handleToggle(item)}
                onPress={() => handleEdit(item)}
                onLongPress={() => handleDelete(item.id)}
              />
            </View>
            <View style={styles.scheduleActions}>
              <TouchableOpacity
                style={styles.scheduleBtn}
                onPress={() => handleScheduleToday(item)}
              >
                <Text style={styles.scheduleBtnText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scheduleBtnAlt}
                onPress={() => handleSchedule(item)}
              >
                <Text style={styles.scheduleBtnAltText}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="⚠️" title="Couldn't load backlog" subtitle="Pull down to retry" />
          ) : searchQuery || statusFilter || showHighPriorityOnly ? (
            <EmptyState icon="🔍" title="No matching tasks" subtitle="Try a different filter or search" />
          ) : (
            <EmptyState icon="🎉" title="Backlog is clear!" subtitle="All tasks are scheduled. Nice work." />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
        />
      )}

      <FAB onPress={() => setModalVisible(true)} accessibilityLabel="Add backlog task" />

      <TaskFormModal
        visible={modalVisible}
        onClose={closeModal}
        onSave={handleSave}
        editingTask={editingTask}
        saving={saving}
        showGoalPicker
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerArea: {
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { fontSize: 14, marginRight: theme.spacing.xs },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: theme.colors.textMuted,
    padding: 4,
  },
  sortBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  sortBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortBtnText: { fontSize: 16, color: theme.colors.textSecondary },
  sortBtnTextActive: { color: "#FFF" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipHighPriority: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  filterChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: { color: "#FFF" },
  weekendPrompt: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warning + "15",
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  weekendPromptText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  taskRowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  taskRowInner: { flex: 1 },
  scheduleActions: {
    flexDirection: "column",
    gap: 4,
  },
  scheduleBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  scheduleBtnText: {
    fontSize: theme.fontSize.xs,
    color: "#FFF",
    fontWeight: "600",
  },
  scheduleBtnAlt: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  scheduleBtnAltText: { fontSize: 14 },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
});

export default BacklogScreen;
