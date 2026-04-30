import React from "react";
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { theme } from "../../theme/theme";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children }) => (
  <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.content} onPress={() => {}}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Pressable>
    </Pressable>
  </RNModal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  closeBtn: { padding: theme.spacing.xs },
  closeBtnText: { fontSize: 18, color: theme.colors.textMuted },
  body: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl },
});

export default Modal;
