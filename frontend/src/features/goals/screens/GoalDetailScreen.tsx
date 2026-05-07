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
import { GoalsStackParamList } from "../../../types";
import { useGoal, useGoalTasks, useLinkTaskToGoal, useUnlinkTaskFromGoal, useDeleteGoal, useUpdateGoal } from "../hooks/useGoals";
import GoalFormModal from "../components/GoalFormModal";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../../tasks/hooks/useTasks";
import ProgressBar from "../../../components/ui/ProgressBar";
import Card from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import TaskRow from "../../tasks/components/TaskRow";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import { Task, TaskCreatePayload } from "../../../types";
import { AppIcon, icons } from "../../../components/ui/Icon";

type GoalDetailRouteProp = RouteProp<GoalsStackParamList, "GoalDetail">;
type GoalDetailNavProp = NativeStackNavigationProp<GoalsStackParamList, "GoalDetail">;

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
  const updateGoal = useUpdateGoal();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [linkExistingVisible, setLinkExistingVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

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

  const handleEditGoal = useCallback(async (payload: { title: string; description?: string; targetDate?: string | null; color?: string }) => {
    setSavingGoal(true);
    try {
      await updateGoal.mutateAsync({ id: goalId, payload });
      setEditModalVisible(false);
      refetchGoal();
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to update goal"));
    } finally {
      setSavingGoal(false);
    }
  }, [goalId, updateGoal, refetchGoal]);

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

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const selectAllTasks = useCallback(() => {
    if (selectedTaskIds.size === unlinkedTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(unlinkedTasks.map((t) => t.id)));
    }
  }, [unlinkedTasks, selectedTaskIds.size]);

  const handleLinkSelectedTasks = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;
    setLinking(true);
    const taskIds = Array.from(selectedTaskIds);
    let successCount = 0;
    let failCount = 0;
    for (const taskId of taskIds) {
      try {
        await linkTask.mutateAsync({ goalId, taskId });
        successCount++;
      } catch {
        failCount++;
      }
    }
    setLinking(false);
    setSelectedTaskIds(new Set());
    setLinkExistingVisible(false);
    refetchTasks();
    refetchGoal();
    if (failCount > 0) {
      Alert.alert(
        "Partially complete",
        `Linked ${successCount} task${successCount !== 1 ? "s" : ""}. ${failCount} failed.`,
      );
    }
  }, [selectedTaskIds, goalId, linkTask, refetchTasks, refetchGoal]);

  const openLinkModal = useCallback(() => {
    setSelectedTaskIds(new Set());
    setLinkExistingVisible(true);
  }, []);

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
                <View style={styles.goalActions}>
                  <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteGoal} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
                  onPress={openLinkModal}
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

      {/* Link Existing Tasks Modal - Multi Select */}
      <RNModal visible={linkExistingVisible} transparent animationType="fade" onRequestClose={() => {
        if (!linking) {
          setLinkExistingVisible(false);
          setSelectedTaskIds(new Set());
        }
      }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Existing Task</Text>
              <TouchableOpacity
                onPress={() => {
                  setLinkExistingVisible(false);
                  setSelectedTaskIds(new Set());
                }}
                style={styles.closeBtn}
                disabled={linking}
              >
                <AppIcon name={icons.x} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {unlinkedTasks.length === 0 ? (
              <View style={styles.modalEmptyState}>
                <EmptyState icon="clipboard" title="No available tasks" subtitle="All tasks are already linked or no tasks exist" />
              </View>
            ) : (
              <>
                <View style={styles.modalToolbar}>
                  <TouchableOpacity onPress={selectAllTasks} style={styles.selectAllBtn}>
                    {selectedTaskIds.size === unlinkedTasks.length ? (
                      <AppIcon name={icons.check} size={16} color={theme.colors.primary} />
                    ) : (
                      <AppIcon name={icons.check} size={16} color={theme.colors.textMuted} />
                    )}
                    <Text style={styles.selectAllText}>
                      {selectedTaskIds.size === unlinkedTasks.length ? "Deselect All" : "Select All"}
                    </Text>
                  </TouchableOpacity>
                  {selectedTaskIds.size > 0 && (
                    <Text style={styles.selectionCount}>
                      {selectedTaskIds.size} selected
                    </Text>
                  )}
                </View>
                <FlatList
                  data={unlinkedTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = selectedTaskIds.has(item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.taskOption, isSelected && styles.taskOptionSelected]}
                        onPress={() => toggleTaskSelection(item.id)}
                        activeOpacity={0.6}
                        disabled={linking}
                      >
                        <View style={[styles.taskOptionCheckbox, isSelected && styles.taskOptionCheckboxSelected]}>
                          {isSelected && <AppIcon name={icons.check} size={14} color="#FFF" />}
                        </View>
                        <View style={styles.taskOptionInfo}>
                          <Text style={[styles.taskOptionTitle, isSelected && styles.taskOptionTitleSelected]} numberOfLines={1}>{item.title}</Text>
                        </View>
                        <Text style={[styles.taskOptionStatus, isSelected && styles.taskOptionStatusSelected]}>
                          {item.status === "done" ? "Done" : item.status === "in_progress" ? "In Progress" : "Todo"}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.taskListContent}
                />
                <View style={styles.modalFooter}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setLinkExistingVisible(false);
                      setSelectedTaskIds(new Set());
                    }}
                    disabled={linking}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={`Link${selectedTaskIds.size > 0 ? ` ${selectedTaskIds.size} Task${selectedTaskIds.size > 1 ? "s" : ""}` : ""}`}
                    onPress={handleLinkSelectedTasks}
                    loading={linking}
                    disabled={selectedTaskIds.size === 0 || linking}
                    style={{ flex: 2 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </RNModal>

      {/* Edit Goal Modal */}
      <GoalFormModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditGoal}
        editingGoal={goal}
        saving={savingGoal}
      />
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
  goalActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  editBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  editBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "500",
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
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  closeBtn: { padding: theme.spacing.xs },
  modalEmptyState: {
    padding: theme.spacing.xxl,
  },
  modalToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  selectAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  selectionCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  taskListContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  taskOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskOptionSelected: {
    backgroundColor: theme.colors.primary + "10",
  },
  taskOptionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  taskOptionCheckboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  taskOptionInfo: {
    flex: 1,
  },
  taskOptionTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  taskOptionTitleSelected: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  taskOptionStatus: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textTransform: "capitalize",
    marginLeft: theme.spacing.sm,
    minWidth: 55,
    textAlign: "right",
  },
  taskOptionStatusSelected: {
    color: theme.colors.primary,
  },
  modalFooter: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});

export default GoalDetailScreen;
