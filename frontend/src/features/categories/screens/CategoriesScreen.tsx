import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import { theme, COLORS } from "../../../theme/theme";
import { useRefreshControl } from "../../../hooks/useRefreshControl";
import { getErrorMessage } from "../../../utils/error";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "../hooks/useCategories";
import CategoryChip from "../components/CategoryChip";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import FAB from "../../../components/ui/FAB";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import Card from "../../../components/ui/Card";
import { Category } from "../../../types";

const DEFAULT_COLOR = theme.colors.primary;

const CategoriesScreen: React.FC = () => {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [appliesTo, setAppliesTo] = useState<"both" | "task" | "habit">("both");
  const [saving, setSaving] = useState(false);

  const { refreshControl } = useRefreshControl({ refetch });

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingCategory(null);
    setName("");
    setSelectedColor(DEFAULT_COLOR);
    setAppliesTo("both");
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setSelectedColor(DEFAULT_COLOR);
    setAppliesTo("both");
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedColor(cat.color);
    setAppliesTo(cat.appliesTo);
    setModalVisible(true);
  };

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a category name");
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          payload: { name: name.trim(), color: selectedColor, appliesTo },
        });
      } else {
        await createCategory.mutateAsync({ name: name.trim(), color: selectedColor, appliesTo });
      }
      setModalVisible(false);
    } catch (e: unknown) {
      Alert.alert("Error", getErrorMessage(e, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  }, [name, selectedColor, appliesTo, editingCategory, createCategory, updateCategory]);

  const handleDelete = useCallback(
    (cat: Category) => {
      Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteCategory.mutate(cat.id, {
              onError: (e: unknown) => Alert.alert("Error", getErrorMessage(e, "Failed to delete category")),
            }),
        },
      ]);
    },
    [deleteCategory]
  );

  if (isLoading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={categories || []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <Card style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryMeta}>{item.appliesTo}</Text>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="warning" title="Couldn't load categories" subtitle="Pull down to retry" />
          ) : (
            <EmptyState icon="tag" title="No categories" subtitle="Categories help organize habits and tasks" />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
      />

      <FAB onPress={openCreate} accessibilityLabel="Add category" />

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Health, Work, Learning"
          placeholderTextColor={theme.colors.textMuted}
          autoFocus
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

        <Text style={styles.label}>Applies To</Text>
        <View style={styles.toggleRow}>
          {(["both", "task", "habit"] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.toggleBtn, appliesTo === opt && styles.toggleBtnActive]}
              onPress={() => setAppliesTo(opt)}
            >
              <Text
                style={[
                  styles.toggleText,
                  appliesTo === opt && styles.toggleTextActive,
                ]}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          {editingCategory && (
            <Button
              title="Delete"
              variant="danger"
              onPress={() => {
                setModalVisible(false);
                handleDelete(editingCategory);
              }}
            />
          )}
          <Button title="Cancel" variant="ghost" onPress={closeModal} />
          <Button title={editingCategory ? "Save" : "Create"} onPress={handleSave} loading={saving} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  listContent: { padding: theme.spacing.lg, paddingTop: theme.spacing.xxxl, paddingBottom: 100 },
  categoryCard: { marginBottom: theme.spacing.sm },
  categoryRow: { flexDirection: "row", alignItems: "center" },
  colorBadge: { width: 12, height: 12, borderRadius: 6, marginRight: theme.spacing.md },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.textPrimary },
  categoryMeta: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, textTransform: "capitalize" },
  categoryActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  actionBtn: { padding: theme.spacing.xs },
  editBtn: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: "600" },
  deleteBtn: { fontSize: theme.fontSize.md, color: theme.colors.danger, fontWeight: "700" },
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
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: theme.colors.textPrimary },
  toggleRow: { flexDirection: "row", gap: theme.spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: "500" },
  toggleTextActive: { color: "#FFF" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
});

export default CategoriesScreen;
