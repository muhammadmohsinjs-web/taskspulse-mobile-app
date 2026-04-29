import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {getTasks, createTask, updateTask, deleteTask} from "../services/api";

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await createTask({title: title.trim()});
      setTitle("");
      fetchTasks();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, {completed: !task.completed});
      fetchTasks();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>TasksPulse</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="New task..."
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({item}) => (
          <View style={styles.taskRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggle(item)}>
              <Text style={styles.checkmark}>
                {item.completed ? "✓" : "○"}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.taskDone,
              ]}>
              {item.title}
            </Text>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks yet. Add one above!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#F5F7FA"},
  centered: {flex: 1, justifyContent: "center", alignItems: "center"},
  heading: {fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 20, color: "#1A1A2E"},
  inputRow: {flexDirection: "row", marginBottom: 16},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#4A90D9",
    borderRadius: 8,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {color: "#FFF", fontSize: 24, fontWeight: "600"},
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {marginRight: 12},
  checkmark: {fontSize: 22, color: "#4A90D9"},
  taskTitle: {flex: 1, fontSize: 16, color: "#1A1A2E"},
  taskDone: {textDecorationLine: "line-through", color: "#9CA3AF"},
  deleteBtn: {fontSize: 16, color: "#EF4444", paddingLeft: 8},
  empty: {textAlign: "center", color: "#9CA3AF", marginTop: 40, fontSize: 16},
});

export default HomeScreen;
