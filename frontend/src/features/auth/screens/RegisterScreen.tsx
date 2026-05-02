import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../../theme/theme";
import { AppIcon, icons } from "../../../components/ui/Icon";
import { TasksPulseLogo } from "../../../components/ui/TasksPulseLogo";
import { useAuth } from "../hooks/useAuth";

const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { register, isSubmitting } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleLogin = () => {
    navigation.navigate("Login" as never);
  };

  const handleRegister = async () => {
    setError(null);
    setShowVerificationMessage(false);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const result = await register({
        email: email.trim(),
        password,
        display_name: displayName.trim() || undefined,
      });
      setVerificationEmail(result.email);
      setShowVerificationMessage(true);
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + theme.spacing.xxl, paddingBottom: insets.bottom + theme.spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <TasksPulseLogo size={60} />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subtitle}>
          Start your productivity journey today.
        </Text>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <AppIcon name={icons.warning} size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {showVerificationMessage ? (
          <View style={styles.verificationContainer}>
            <AppIcon name={icons.mail} size={48} color={theme.colors.primary} />
            <Text style={styles.verificationHeading}>Check your email</Text>
            <Text style={styles.verificationText}>
              We sent a verification link to {verificationEmail}. Verify your account before logging in.
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
          {/* Display Name */}
          <Text style={styles.label}>Display Name (optional)</Text>
          <View style={styles.inputRow}>
            <AppIcon name={icons.user} size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={(t) => { setDisplayName(t); setError(null); }}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isSubmitting}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <AppIcon name={icons.mail} size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <AppIcon name={icons.lock} size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon
                name={showPassword ? icons.eyeOff : icons.eye}
                size={20}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <AppIcon name={icons.lock} size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
              placeholder="Re-enter your password"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isSubmitting}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerBtn, isSubmitting && styles.registerBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} disabled={isSubmitting}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    flexGrow: 1,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  heading: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xxl,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: -theme.spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
    marginLeft: theme.spacing.sm,
  },
  eyeBtn: {
    padding: theme.spacing.xs,
  },
  registerBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textOnPrimary,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  loginText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  verificationContainer: {
    alignItems: "center",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xxxl,
  },
  verificationHeading: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  verificationText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default RegisterScreen;
