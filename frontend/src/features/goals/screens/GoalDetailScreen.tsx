import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal as RNModal,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { MoreStackParamList } from "../../../types";
import { useGoal, useGoalTasks, useLinkTaskToGoal, useUnlinkTaskFromGoal, useDeleteGoal } from "../hooks/useGoals";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../../tasks/hooks/useTasks";
import ProgressBar from "../../../components/ui/ProgressBar";
import Card from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import TaskRow from "../../tasks/components/TaskRow";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import { Task, TaskCreatePayload } from "../../../types";

type GoalDetailRouteProp = RouteProp<MoreStackParamList, "GoalDetail">;
type GoalDetailNavProp = NativeStackNavigationProp<MoreStackParamList, "GoalDetail">;

const GoalDetailScreen: React.FC = () => {
  const route = useRoute<GoalDetailRouteProp>();
  const navigation = useNavigation<GoalDetailNavProp>();
  const { goalId } = route.params;

  const { data: goal, isLoading, isError, refetch: refetchGoal } = useGoal(goalId);
  const { data: tasks, refetch: refetchTasks } = useGoalTasks(goalId);
  const { data: allTasks } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const linkTask = useLinkTaskToGoal();
  const unlinkTask = useUnlinkTaskFromGoal();
  const deleteGoal = useDeleteGoal();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [linkExistingVisible, setLinkExistingVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const linkedTaskIds = useMemo(() => new Set((tasks || []).map((t) => t.id)), [tasks]);
  const unlinkedTasks = useMemo(
    () => (allTasks || []).filter((t) => !linkedTaskIds.has(t.id)),
    [allTasks, linkedTaskIds]
  );

  const handleRefresh = useCallback(
    async () => { await Promise.all([refetchGoal(), refetchTasks()]); },
    [refetchGoal, refetchTasks]
  );
  const { refreshControl } = useRefreshControl({ refetch: handleRefresh });

  const handleToggleTask = useCallback(
    (task: Task) => {
      const nextStatus = task.status === "done" ? "todo" : "done";
      updateTask.mutate(
        { id: task.id, payload: { status: nextStatus } },
        {
          onSuccess: () => refetchGoal(),
          onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to update task")),
        }
      );
    },
    [updateTask, refetchGoal]
  );

  const handleLinkNewTask = useCallback(
    async (payload: TaskCreatePayload) => {
      setSaving(true);
      let newTaskId: string | null = null;
      try {
        const newTask = await createTask.mutateAsync(payload);
        newTaskId = newTask.id;
        await linkTask.mutateAsync({ goalId, taskId: newTaskId });
        refetchTasks();
        refetchGoal();
        setAddModalVisible(false);
      } catch (e: unknown) {
        if (newTaskId) {
          deleteTask.mutate(newTaskId);
        }
        Alert.alert("Error", getErrorMessage(e, "Failed to create task"));
      } finally {
        setSaving(false);
      }
    },
    [goalId, createTask, linkTask, deleteTask, refetchTasks, refetchGoal]
  );

  const handleUnlink = useCallback(
    (taskId: string) => {
      Alert.alert("Unlink Task", "Remove this task from the goal?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          onPress: () => {
            unlinkTask.mutate(
              { goalId, taskId },
              {
                onSuccess: () => {
                  refetchTasks();
                  refetchGoal();
                },
                onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to unlink")),
              }
            );
          },
        },
      ]);
    },
    [goalId, unlinkTask, refetchTasks, refetchGoal]
  );

  const handleDeleteGoal = useCallback(() => {
    Alert.alert("Delete Goal", "Linked tasks will be unlinked. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteGoal.mutate(goalId, {
            onSuccess: () => navigation.goBack(),
             onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to delete goal")),
          });
        },
      },
    ]);
  }, [goalId, deleteGoal, navigation]);

  const handleLinkExistingTask = useCallback(
    (taskId: string) => {
      linkTask.mutate(
        { goalId, taskId },
        {
          onSuccess: () => {
            setLinkExistingVisible(false);
            refetchTasks();
            refetchGoal();
          },
          onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to link task")),
        }
      );
    },
    [goalId, linkTask, refetchTasks, refetchGoal]
  );

  if (isLoading) return <LoadingSpinner message="Loading goal..." />;
  if (isError || !goal) return <EmptyState icon="warning" title="Goal not found" subtitle="It may have been deleted" />;

  const goalCardStyle: import("react-native").ViewStyle = {
    ...styles.goalCard,
    borderLeftColor: goal.color,
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks || []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View>
            <Card style={goalCardStyle}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <TouchableOpacity onPress={handleDeleteGoal} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
              {goal.description ? (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              ) : null}
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>
                  Progress ({goal.completedTasks}/{goal.totalTasks} tasks)
                </Text>
                <ProgressBar progress={goal.progress} color={goal.color} height={8} />
              </View>
              {goal.targetDate ? (
                <Text style={styles.targetDate}>Target: {goal.targetDate}</Text>
              ) : null}
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Linked Tasks</Text>
              <View style={styles.actionButtons}>
                <Button
                  title="Link Existing"
                  variant="secondary"
                  onPress={() => setLinkExistingVisible(true)}
                  style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                />
                <Button
                  title="+ Add Task"
                  variant="secondary"
                  onPress={() => setAddModalVisible(true)}
                  style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <TaskRow
              task={item}
              onToggle={() => handleToggleTask(item)}
              onPress={() => handleToggleTask(item)}
              onLongPress={() => handleUnlink(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="clipboard" title="No linked tasks" subtitle="Tap Add Task to link a task to this goal" />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      {/* Add Task Modal */}
      <TaskFormModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleLinkNewTask}
        saving={saving}
      />

      {/* Link Existing Task Modal */}
      <RNModal visible={linkExistingVisible} transparent animationType="fade" onRequestClose={() => setLinkExistingVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Existing Task</Text>
              <TouchableOpacity onPress={() => setLinkExistingVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            {unlinkedTasks.length === 0 ? (
              <EmptyState icon="clipboard" title="No available tasks" subtitle="All tasks are already linked or no tasks exist" />
            ) : (
              <FlatList
                data={unlinkedTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.taskOption}
                    onPress={() => handleLinkExistingTask(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.taskOptionCheckbox} />
                    <Text style={styles.taskOptionTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.taskOptionStatus}>{item.status}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.taskListContent}
              />
            )}
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
    goalCard: {
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  goalTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  goalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  progressSection: {
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  targetDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  deleteBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  deleteBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  closeBtn: { padding: theme.spacing.xs },
  closeBtnText: { fontSize: 18, color: theme.colors.textMuted },
  taskListContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  taskOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskOptionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  taskOptionTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  taskOptionStatus: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textTransform: "capitalize",
  },
});

export default GoalDetailScreen;
