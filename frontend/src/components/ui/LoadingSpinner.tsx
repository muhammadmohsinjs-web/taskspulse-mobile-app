import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    {message && <Text style={styles.text}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.xxxl },
  text: { marginTop: theme.spacing.md, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
});

export default LoadingSpinner;
