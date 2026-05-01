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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme, COLORS } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { isValidDateString } from "../../../utils/date";
import { useGoals, useCreateGoal, useDeleteGoal } from "../hooks/useGoals";
import { MoreStackParamList } from "../../../types";
import GoalCard from "../components/GoalCard";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";

type GoalsListNavProp = NativeStackNavigationProp<MoreStackParamList, "GoalsList">;

const DEFAULT_COLOR = theme.colors.primary;

const GoalsListScreen: React.FC = () => {
  const navigation = useNavigation<GoalsListNavProp>();
  const { data: goals, isLoading, isError, refetch } = useGoals();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTitle("");
    setDescription("");
    setTargetDate("");
    setSelectedColor(DEFAULT_COLOR);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a goal name");
      return;
    }
    if (!isValidDateString(targetDate)) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format");
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
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to create goal"));
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
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      <FAB onPress={() => setModalVisible(true)} accessibilityLabel="Add goal" />

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
