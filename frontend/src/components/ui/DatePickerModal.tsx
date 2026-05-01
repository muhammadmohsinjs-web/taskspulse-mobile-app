import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { theme } from "../../theme/theme";
import Button from "./Button";

interface DatePickerModalProps {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, date, onConfirm, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(date);

  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(event: DateTimePickerEvent, d?: Date) => {
          if (event.type === "dismissed") {
            onCancel();
          } else if (d) {
            onConfirm(d);
          }
        }}
      />
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Select Date</Text>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="inline"
            themeVariant="light"
            onChange={(_event: DateTimePickerEvent, d?: Date) => {
              if (d) setSelectedDate(d);
            }}
          />
          <View style={styles.actions}>
            <Button title="Cancel" variant="ghost" onPress={onCancel} />
            <Button title="Done" onPress={() => onConfirm(selectedDate)} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadow,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
});

export default DatePickerModal;
