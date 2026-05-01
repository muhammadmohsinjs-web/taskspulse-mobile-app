import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme/theme";

import DailyCockpitScreen from "../features/cockpit/screens/DailyCockpitScreen";
import HabitsListScreen from "../features/habits/screens/HabitsListScreen";
import CategoriesScreen from "../features/categories/screens/CategoriesScreen";
import TaskListScreen from "../features/tasks/screens/TaskListScreen";
import GoalsListScreen from "../features/goals/screens/GoalsListScreen";
import GoalDetailScreen from "../features/goals/screens/GoalDetailScreen";
import BacklogScreen from "../features/backlog/screens/BacklogScreen";
import MonthlyCalendarScreen from "../features/calendar/screens/MonthlyCalendarScreen";
import DateDetailScreen from "../features/calendar/screens/DateDetailScreen";
import AnalyticsScreen from "../features/analytics/screens/AnalyticsScreen";

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const TodayStack = createNativeStackNavigator();
const CalendarStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerShown: true as const,
  headerTintColor: theme.colors.primary,
  headerStyle: { backgroundColor: theme.colors.background },
};

const TodayStackNavigator = () => (
  <TodayStack.Navigator screenOptions={{ headerShown: false }}>
    <TodayStack.Screen name="Cockpit" component={DailyCockpitScreen} />
    <TodayStack.Screen
      name="TaskList"
      component={TaskListScreen}
      options={{ ...stackScreenOptions, headerTitle: "All Tasks" }}
    />
    <TodayStack.Screen
      name="HabitsList"
      component={HabitsListScreen}
      options={{ ...stackScreenOptions, headerTitle: "Habits" }}
    />
    <TodayStack.Screen
      name="Backlog"
      component={BacklogScreen}
      options={{ ...stackScreenOptions, headerTitle: "Backlog" }}
    />
  </TodayStack.Navigator>
);

const CalendarStackNavigator = () => (
  <CalendarStack.Navigator>
    <CalendarStack.Screen
      name="MonthlyCalendar"
      component={MonthlyCalendarScreen}
      options={{ headerShown: false }}
    />
    <CalendarStack.Screen
      name="DateDetail"
      component={DateDetailScreen}
      options={{
        ...stackScreenOptions,
        headerTitle: "Date",
      }}
    />
  </CalendarStack.Navigator>
);

const MoreStackNavigator = () => (
  <MoreStack.Navigator>
    <MoreStack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{ ...stackScreenOptions, headerTitle: "Categories" }}
    />
    <MoreStack.Screen
      name="GoalsList"
      component={GoalsListScreen}
      options={{ ...stackScreenOptions, headerTitle: "Goals" }}
    />
    <MoreStack.Screen
      name="GoalDetail"
      component={GoalDetailScreen}
      options={{ ...stackScreenOptions, headerTitle: "Goal" }}
    />
    <MoreStack.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ ...stackScreenOptions, headerTitle: "Analytics" }}
    />
  </MoreStack.Navigator>
);

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Today: "☀️",
    Calendar: "📅",
    Backlog: "📥",
    More: "⋮",
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || "•"}
    </Text>
  );
};

const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 4 + insets.bottom,
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
      <Tab.Screen name="Backlog" component={BacklogScreen} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
};

export default RootNavigator;
