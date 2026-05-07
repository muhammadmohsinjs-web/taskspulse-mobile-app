import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useGoals, useCreateGoal, useDeleteGoal } from "../hooks/useGoals";
import { GoalsStackParamList } from "../../../types";
import GoalCard from "../components/GoalCard";
import GoalFormModal from "../components/GoalFormModal";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";

type GoalsListNavProp = NativeStackNavigationProp<GoalsStackParamList, "GoalsList">;

const GoalsListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GoalsListNavProp>();
  const { data: goals, isLoading, isError, refetch } = useGoals();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const handleSave = useCallback(async (payload: { title: string; description?: string; targetDate?: string | null; color?: string }) => {
    setSaving(true);
    try {
      await createGoal.mutateAsync(payload);
      setModalVisible(false);
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to create goal"));
    } finally {
      setSaving(false);
    }
  }, [createGoal]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete Goal", "Linked tasks will be unlinked. Continue?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteGoal.mutate(id, {
              onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to delete goal")),
            }),
        },
      ]);
    },
    [deleteGoal]
  );

  if (isLoading) return <LoadingSpinner message="Loading goals..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={goals || []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="warning" title="Couldn't load goals" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="target" title="No goals yet" subtitle="Tap + to create your first goal" />
          )
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + theme.spacing.lg },
        ]}
        refreshControl={refreshControl}
      />

      <FAB onPress={() => setModalVisible(true)} accessibilityLabel="Add goal" />

      <GoalFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
});

export default GoalsListScreen;
