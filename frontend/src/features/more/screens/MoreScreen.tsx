import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme/theme";
import Card from "../../../components/ui/Card";
import { AppIcon, icons } from "../../../components/ui/Icon";

type MoreStackParamList = {
  Categories: undefined;
  Analytics: undefined;
  WeeklyPlanning: undefined;
  Settings: undefined;
};

type MoreNavProp = NativeStackNavigationProp<MoreStackParamList>;

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof icons;
  screen: keyof MoreStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "categories",
    title: "Categories",
    subtitle: "Organize habits and tasks",
    iconName: "tag",
    screen: "Categories",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "View your progress insights",
    iconName: "chart",
    screen: "Analytics",
  },
  {
    id: "weekly-planning",
    title: "Weekly Planning",
    subtitle: "Plan your week ahead",
    iconName: "list",
    screen: "WeeklyPlanning",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "App preferences and data",
    iconName: "settings",
    screen: "Settings",
  },
];

const MoreScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MoreNavProp>();

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <AppIcon name={item.iconName} size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <AppIcon name="chevron" size={20} color={theme.colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + theme.spacing.lg },
        ]}
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
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  heading: {
    fontSize: theme.fontSize.heading,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  card: { marginBottom: theme.spacing.sm },
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
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
});

export default MoreScreen;
