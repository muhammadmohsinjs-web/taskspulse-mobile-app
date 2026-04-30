import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { theme } from "../../theme/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    variant === "ghost" && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.text,
    variant === "primary" && styles.textPrimary,
    variant === "secondary" && styles.textSecondary,
    variant === "danger" && styles.textDanger,
    variant === "ghost" && styles.textGhost,
    isDisabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={isDisabled} activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFF" : theme.colors.primary} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  danger: { backgroundColor: theme.colors.danger },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  text: { fontSize: theme.fontSize.md, fontWeight: "600" },
  textPrimary: { color: "#FFF" },
  textSecondary: { color: theme.colors.primary },
  textDanger: { color: "#FFF" },
  textGhost: { color: theme.colors.primary },
  textDisabled: { color: theme.colors.textMuted },
});

export default Button;
