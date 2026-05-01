import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { theme } from "../../../theme/theme";
import Card from "../../../components/ui/Card";
import { useOnboarding } from "../../../navigation/RootNavigator";

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, onPress, danger }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
      {label}
    </Text>
    {value ? (
      <Text style={styles.settingValue}>{value}</Text>
    ) : onPress ? (
      <Text style={styles.settingArrow}>›</Text>
    ) : null}
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const { restartOnboarding } = useOnboarding();

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will delete all your tasks, habits, goals, and categories. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => Alert.alert("Not implemented", "Data reset will be available in a future update."),
        },
      ]
    );
  };

  const handleRestartOnboarding = () => {
    Alert.alert(
      "Restart Onboarding",
      "This will take you back to the onboarding screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: async () => {
            await restartOnboarding();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.card}>
        <SettingRow label="App Version" value="0.3.0" />
        <View style={styles.divider} />
        <SettingRow label="Backend" value="FastAPI + SQLite" />
        <View style={styles.divider} />
        <SettingRow label="Frontend" value="React Native + Expo" />
      </Card>

      <Text style={styles.sectionTitle}>Data</Text>
      <Card style={styles.card}>
        <SettingRow label="Data Location" value="Local SQLite" />
      </Card>

      <Text style={styles.sectionTitle}>Danger Zone</Text>
      <Card style={styles.card}>
        <SettingRow
          label="Restart Onboarding"
          onPress={handleRestartOnboarding}
          danger
        />
        <View style={styles.divider} />
        <SettingRow
          label="Reset All Data"
          onPress={handleResetData}
          danger
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>TasksPulse</Text>
        <Text style={styles.footerSubtext}>Your personal productivity coach</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  card: {
    marginHorizontal: theme.spacing.lg,
    padding: 0,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  settingLabelDanger: {
    color: theme.colors.danger,
  },
  settingValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  settingArrow: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  footer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxxl * 2,
  },
  footerText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  footerSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});

export default SettingsScreen;
