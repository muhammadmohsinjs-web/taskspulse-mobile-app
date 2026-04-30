export const COLORS = ["#4A90D9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

export const theme = {
  colors: {
    primary: "#4A90D9",
    primaryDark: "#357ABD",
    background: "#F5F7FA",
    surface: "#FFFFFF",
    textPrimary: "#1A1A2E",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    border: "#E5E7EB",
    streak: "#F59E0B",
    streakActive: "#EF4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    heading: 28,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};

export type Theme = typeof theme;
