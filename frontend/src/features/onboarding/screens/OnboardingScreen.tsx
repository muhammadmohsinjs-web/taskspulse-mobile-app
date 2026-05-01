import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme/theme";
import { TasksPulseLogo } from "../../../components/ui/TasksPulseLogo";



interface OnboardingScreenProps {
  onGetStarted: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onGetStarted }) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentMaxWidth = Math.min(windowWidth - 48, 640);

  const handleAuthComingSoon = (provider: "Google" | "Apple" | "Sign In") => {
    Alert.alert("Coming Soon", `${provider} authentication will be added later.`);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + theme.spacing.xxl,
          paddingBottom: insets.bottom + theme.spacing.xxl,
        },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <TasksPulseLogo size={36} />
          <Text style={styles.logoText}>
            <Text style={styles.logoTextTasks}>tasks</Text>
            <Text style={styles.logoTextPulse}>pulse</Text>
          </Text>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={require("../../../../assets/screens/hero-image.png")}
            style={[styles.heroImage, { width: contentMaxWidth * 0.9, height: contentMaxWidth * 0.7 }]}
            resizeMode="contain"
            accessible={false}
          />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          <Text style={styles.headlineDark}>Plan your day.{"\n"}Stay consistent.{"\n"}</Text>
          <Text style={styles.headlineBlue}>Achieve your goals.</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          All your habits, tasks, and goals{"\n"}in one daily cockpit.
        </Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Get Started */}
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.getStartedArrow}>→</Text>
        </TouchableOpacity>

        {/* Social Buttons */}
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleAuthComingSoon("Google")}
          activeOpacity={0.7}
        >
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleAuthComingSoon("Apple")}
          activeOpacity={0.7}
        >
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Sign In */}
        <TouchableOpacity
          onPress={() => handleAuthComingSoon("Sign In")}
          activeOpacity={0.6}
        >
          <Text style={styles.signInText}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const BRAND_BLUE = "#2563EB";
const BRAND_TEAL = "#14B8A6";

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    alignItems: "center",
  },
  inner: {
    width: "100%",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "600",
  },
  logoTextTasks: {
    color: BRAND_BLUE,
  },
  logoTextPulse: {
    color: BRAND_TEAL,
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  heroImage: {
    alignSelf: "center",
  },
  headline: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: theme.spacing.md,
  },
  headlineDark: {
    color: theme.colors.textPrimary,
  },
  headlineBlue: {
    color: BRAND_BLUE,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.xxl,
  },
  dotsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: BRAND_BLUE,
    width: 24,
  },
  getStartedBtn: {
    backgroundColor: BRAND_BLUE,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 56,
    marginBottom: theme.spacing.xxl,
  },
  getStartedText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
  },
  getStartedArrow: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    marginLeft: theme.spacing.sm,
  },
  socialBtn: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 52,
    marginBottom: theme.spacing.md,
  },
  socialText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  signInText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  signInLink: {
    color: BRAND_BLUE,
    fontWeight: "700",
  },
});

export default OnboardingScreen;
