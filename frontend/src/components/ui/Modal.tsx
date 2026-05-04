import React from "react";
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { theme } from "../../theme/theme";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
  closeOnBackdropPress?: boolean;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children, overlay, closeOnBackdropPress = true }) => (
  <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={closeOnBackdropPress ? onClose : undefined}>
      <Pressable style={styles.content} onPress={() => {}}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {overlay}
        </View>
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
    overflow: "hidden",
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
  bodyContainer: {
    position: "relative",
  },
  body: {
    maxHeight: 500,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
});

export default Modal;
