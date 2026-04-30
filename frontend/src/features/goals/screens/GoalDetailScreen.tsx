import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { MoreStackParamList } from "../../../types";
import { useGoal, useLinkTaskToGoal, useUnlinkTaskFromGoal, useDeleteGoal } from "../hooks/useGoals";
import { useTasks, useCreateTask, useUpdateTask } from "../../tasks/hooks/useTasks";
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
  const { data: tasks, refetch: refetchTasks } = useTasks({ goalId });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const linkTask = useLinkTaskToGoal();
  const unlinkTask = useUnlinkTaskFromGoal();
  const deleteGoal = useDeleteGoal();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

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
      try {
        const newTask = await createTask.mutateAsync(payload);
        await linkTask.mutateAsync({ goalId, taskId: newTask.id });
        refetchTasks();
        refetchGoal();
        setAddModalVisible(false);
      } catch (e: unknown) {
        Alert.alert("Error", getErrorMessage(e, "Failed to create task"));
      } finally {
        setSaving(false);
      }
    },
    [goalId, createTask, linkTask, refetchTasks, refetchGoal]
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

  if (isLoading) return <LoadingSpinner message="Loading goal..." />;
  if (isError || !goal) return <EmptyState icon="⚠️" title="Goal not found" subtitle="It may have been deleted" />;

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
              <Button title="+ Add Task" variant="secondary" onPress={() => setAddModalVisible(true)} style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
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
          <EmptyState icon="📋" title="No linked tasks" subtitle="Tap Add Task to link a task to this goal" />
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
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
});

export default GoalDetailScreen;
