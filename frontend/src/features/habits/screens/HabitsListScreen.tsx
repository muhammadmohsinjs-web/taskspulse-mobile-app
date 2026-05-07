import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { theme } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useHabits, useCreateHabit, useUpdateHabit, useToggleHabit, useDeleteHabit } from "../hooks/useHabits";
import HabitRow from "../components/HabitRow";
import HabitFormModal from "../components/HabitFormModal";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import { Habit } from "../../../types";

const HabitsListScreen: React.FC = () => {
  const { data: habits, isLoading, isError, refetch } = useHabits();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const toggleHabit = useToggleHabit();
  const deleteHabit = useDeleteHabit();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [saving, setSaving] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const handleSave = useCallback(async (payload: { title: string; description?: string; categoryId?: string | null; recurrenceRule?: string; color?: string }) => {
    setSaving(true);
    try {
      if (editingHabit) {
        await updateHabit.mutateAsync({ id: editingHabit.id, payload });
      } else {
        await createHabit.mutateAsync(payload);
      }
      setModalVisible(false);
      setEditingHabit(null);
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to save habit"));
    } finally {
      setSaving(false);
    }
  }, [editingHabit, createHabit, updateHabit]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete Habit", "Are you sure? Streak data will be lost.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteHabit.mutate(id, {
              onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to delete habit")),
            }),
        },
      ]);
    },
    [deleteHabit]
  );

  const openEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);

  const openCreate = useCallback(() => {
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading habits..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={habits || []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <HabitRow
            habit={item}
            onPress={() => openEdit(item)}
            onToggle={() =>
              toggleHabit.mutate(
                { id: item.id, completedToday: item.completedToday },
                { onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to update habit")) }
              )
            }
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="warning" title="Couldn't load habits" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="sprout" title="No habits yet" subtitle="Tap + to create your first habit" />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      <FAB onPress={openCreate} accessibilityLabel="Add habit" />

      <HabitFormModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingHabit(null); }}
        onSave={handleSave}
        editingHabit={editingHabit}
        saving={saving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
});

export default HabitsListScreen;
