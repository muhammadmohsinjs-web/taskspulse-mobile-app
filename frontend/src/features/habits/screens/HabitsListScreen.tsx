import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { theme, COLORS } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useHabits, useCreateHabit, useToggleHabit, useDeleteHabit } from "../hooks/useHabits";
import { useCategories } from "../../categories/hooks/useCategories";
import HabitRow from "../components/HabitRow";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import CategoryChip from "../../categories/components/CategoryChip";
import { Category } from "../../../types";

const DEFAULT_COLOR = theme.colors.primary;

const HabitsListScreen: React.FC = () => {
  const { data: habits, isLoading, isError, refetch } = useHabits();
  const { data: categories } = useCategories();
  const createHabit = useCreateHabit();
  const toggleHabit = useToggleHabit();
  const deleteHabit = useDeleteHabit();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTitle("");
    setDescription("");
    setSelectedCategoryId(null);
    setSelectedColor(DEFAULT_COLOR);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a habit name");
      return;
    }
    setSaving(true);
    try {
      await createHabit.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId,
        color: selectedColor,
      });
      closeModal();
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to create habit"));
    } finally {
      setSaving(false);
    }
  }, [title, description, selectedCategoryId, selectedColor, createHabit, closeModal]);

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

      <FAB onPress={() => setModalVisible(true)} accessibilityLabel="Add habit" />

      {/* Create Modal */}
      <Modal visible={modalVisible} onClose={closeModal} title="New Habit">
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Morning meditation"
          placeholderTextColor={theme.colors.textMuted}
          autoFocus
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What does this habit involve?"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>Category (optional)</Text>
        <View style={styles.chipRow}>
          {categories?.map((cat: Category) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={selectedCategoryId === cat.id}
              onPress={() =>
                setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)
              }
            />
          ))}
        </View>

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                selectedColor === c && styles.colorDotSelected,
              ]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>

        <View style={styles.modalActions}>
          <Button title="Cancel" variant="ghost" onPress={closeModal} />
          <Button title="Create Habit" onPress={handleCreate} loading={saving} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing.lg, paddingBottom: 100 },
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: theme.spacing.sm },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: theme.colors.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
});

export default HabitsListScreen;
