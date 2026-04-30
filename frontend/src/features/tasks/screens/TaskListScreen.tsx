import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  RefreshControl,
} from "react-native";
import { theme } from "../../../theme/theme";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import TaskRow from "../components/TaskRow";
import TaskFormModal from "../components/TaskFormModal";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { Task, TaskCreatePayload, TaskUpdatePayload } from "../../../types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

const TaskListScreen: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: tasks, isLoading, isError, refetch } = useTasks(
    statusFilter ? { status: statusFilter } : undefined
  );
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

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
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to save task");
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
        {
          onError: (e: any) => Alert.alert("Error", e.message || "Failed to update task"),
        }
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
              onError: (e: any) => Alert.alert("Error", e.message || "Failed to delete task"),
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

  if (isLoading) return <LoadingSpinner message="Loading tasks..." />;

  return (
    <View style={styles.container}>
      {/* Status Filter */}
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
      </View>

      <FlatList
        data={tasks || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onToggle={() => handleToggle(item)}
            onPress={() => handleEdit(item)}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="⚠️" title="Couldn't load tasks" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="📝" title="No tasks yet" subtitle="Tap + to create your first task" />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create/Edit Modal */}
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
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

export default TaskListScreen;
