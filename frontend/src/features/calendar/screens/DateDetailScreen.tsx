import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask } from "../../tasks/hooks/useTasks";
import TaskRow from "../../tasks/components/TaskRow";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import Card from "../../../components/ui/Card";
import ProgressBar from "../../../components/ui/ProgressBar";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { Task, TaskCreatePayload, TaskUpdatePayload } from "../../../types";
import { CalendarStackParamList } from "../../../types/navigation";

type DateDetailRouteProp = RouteProp<CalendarStackParamList, "DateDetail">;

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function relativeDateLabel(iso: string): string {
  const today = new Date();
  const target = new Date(iso);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days from now`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return "";
}

const DateDetailScreen: React.FC = () => {
  const route = useRoute<DateDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<CalendarStackParamList, "DateDetail">>();
  const { date } = route.params;

  const { data: tasks, isLoading, isError, refetch } = useTasks({ date });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [saving, setSaving] = React.useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const groupedTasks = useMemo(() => {
    const groups: { todo: Task[]; in_progress: Task[]; done: Task[] } = {
      todo: [],
      in_progress: [],
      done: [],
    };
    tasks?.forEach((t) => {
      if (t.status === "todo") groups.todo.push(t);
      else if (t.status === "in_progress") groups.in_progress.push(t);
      else if (t.status === "done") groups.done.push(t);
    });
    return groups;
  }, [tasks]);

  const sectionedData = useMemo(() => {
    const sections: { type: "header"; status: string; count: number }[] = [];
    if (groupedTasks.todo.length > 0) sections.push({ type: "header", status: "todo", count: groupedTasks.todo.length });
    if (groupedTasks.in_progress.length > 0) sections.push({ type: "header", status: "in_progress", count: groupedTasks.in_progress.length });
    if (groupedTasks.done.length > 0) sections.push({ type: "header", status: "done", count: groupedTasks.done.length });
    return sections;
  }, [groupedTasks]);

  const totalTasks = tasks?.length ?? 0;
  const completedCount = groupedTasks.done.length;
  const progress = totalTasks > 0 ? completedCount / totalTasks : 0;

  const relativeLabel = relativeDateLabel(date);

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
          await createTask.mutateAsync({ ...payload, dueDate: date });
        }
        closeModal();
      } catch (e: unknown) {
        Alert.alert("Error", getErrorMessage(e, "Failed to save task"));
      } finally {
        setSaving(false);
      }
    },
    [editingTask, createTask, updateTask, closeModal, date]
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
      Alert.alert("Delete Task", "Are you sure?", [
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: formatFullDate(date),
    });
  }, [navigation, date]);

  const STATUS_LABELS: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Completed",
  };

  const taskIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    tasks?.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  if (isLoading) return <LoadingSpinner message="Loading tasks..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks || []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {relativeLabel ? (
              <Text style={styles.relativeLabel}>{relativeLabel}</Text>
            ) : null}

            {/* Day Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryStatBox}>
                  <Text style={styles.summaryStatValue}>{totalTasks}</Text>
                  <Text style={styles.summaryStatLabel}>Total</Text>
                </View>
                <View style={styles.summaryStatBox}>
                  <Text style={styles.summaryStatValue}>{completedCount}</Text>
                  <Text style={styles.summaryStatLabel}>Done</Text>
                </View>
                <View style={styles.progressBox}>
                  <ProgressBar progress={progress} color={theme.colors.success} height={8} />
                  <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>
              </View>
            </Card>

            {/* Section headers are rendered inline per group in renderItem */}
          </>
        }
        renderItem={({ item }) => {
          // Determine the section for this task
          let sectionIndex = 0;
          if (item.status === "todo") sectionIndex = 0;
          else if (item.status === "in_progress") sectionIndex = 1;
          else sectionIndex = 2;

          // Only render after its section header
          const prevSectionCount = sectionedData
            .slice(0, sectionIndex)
            .reduce((sum, s) => sum + s.count, 0);
          const currentSectionCount = sectionedData[sectionIndex]?.count ?? 0;
          const positionInSection =
            (taskIndexMap.get(item.id) ?? 0) - prevSectionCount;

          // Add section header before first item of each group
          const showHeader = positionInSection === 0 && sectionedData[sectionIndex] !== undefined;

          return (
            <View>
              {showHeader && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>
                    {STATUS_LABELS[item.status]} ({currentSectionCount})
                  </Text>
                </View>
              )}
              <TaskRow
                task={item}
                onToggle={() => handleToggle(item)}
                onPress={() => handleEdit(item)}
                onLongPress={() => handleDelete(item.id)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="⚠️" title="Couldn't load tasks" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="📅" title="No tasks for this day" subtitle="Tap + to add one" />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      <FAB onPress={() => setModalVisible(true)} accessibilityLabel="Add task" />

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  relativeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  summaryStatBox: {
    alignItems: "center",
  },
  summaryStatValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  summaryStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  progressBox: {
    flex: 1,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: "right",
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  sectionHeaderText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default DateDetailScreen;
