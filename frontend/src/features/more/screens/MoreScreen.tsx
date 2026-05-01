import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../../theme/theme";
import Card from "../../../components/ui/Card";

type MoreStackParamList = {
  Categories: undefined;
  GoalsList: undefined;
  Analytics: undefined;
  WeeklyPlanning: undefined;
  Settings: undefined;
};

type MoreNavProp = NativeStackNavigationProp<MoreStackParamList>;

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  screen: keyof MoreStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "categories",
    title: "Categories",
    subtitle: "Organize habits and tasks",
    icon: "🏷️",
    screen: "Categories",
  },
  {
    id: "goals",
    title: "Goals",
    subtitle: "Track long-term objectives",
    icon: "🎯",
    screen: "GoalsList",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "View your progress insights",
    icon: "📊",
    screen: "Analytics",
  },
  {
    id: "weekly-planning",
    title: "Weekly Planning",
    subtitle: "Plan your week ahead",
    icon: "📋",
    screen: "WeeklyPlanning",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "App preferences and data",
    icon: "⚙️",
    screen: "Settings",
  },
];

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<MoreNavProp>();

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>More</Text>
        <FlatList
          data={MENU_ITEMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl },
  heading: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  card: { marginBottom: theme.spacing.sm },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { fontSize: 24, marginRight: theme.spacing.md },
  content: { flex: 1 },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textMuted,
    fontWeight: "300",
  },
});

export default MoreScreen;
