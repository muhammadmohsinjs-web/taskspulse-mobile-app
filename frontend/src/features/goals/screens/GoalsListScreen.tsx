import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { theme } from "../../../theme/theme";
import { useGoals, useCreateGoal, useDeleteGoal } from "../hooks/useGoals";
import GoalCard from "../components/GoalCard";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";

const COLORS = ["#4A90D9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

interface GoalsListScreenProps {
  navigation: any;
}

const GoalsListScreen: React.FC<GoalsListScreenProps> = ({ navigation }) => {
  const { data: goals, isLoading, isError, refetch } = useGoals();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
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
    setTitle("");
    setDescription("");
    setTargetDate("");
    setSelectedColor(COLORS[0]);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a goal name");
      return;
    }
    setSaving(true);
    try {
      await createGoal.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate.trim() || null,
        color: selectedColor,
      });
      closeModal();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create goal");
    } finally {
      setSaving(false);
    }
  }, [title, description, targetDate, selectedColor, createGoal, closeModal]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete Goal", "Linked tasks will be unlinked. Continue?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteGoal.mutate(id, {
              onError: (e: any) => Alert.alert("Error", e.message || "Failed to delete goal"),
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
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="⚠️" title="Couldn't load goals" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="🎯" title="No goals yet" subtitle="Tap + to create your first goal" />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={modalVisible} onClose={closeModal} title="New Goal">
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Launch MVP"
          placeholderTextColor={theme.colors.textMuted}
          autoFocus
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="What does success look like?"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Target Date (YYYY-MM-DD, optional)</Text>
        <TextInput
          style={styles.input}
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="e.g. 2026-06-01"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numbers-and-punctuation"
        />

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
          <Button title="Create Goal" onPress={handleCreate} loading={saving} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  multiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
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
  },
});

export default GoalsListScreen;
