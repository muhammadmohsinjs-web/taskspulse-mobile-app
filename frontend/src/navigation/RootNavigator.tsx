import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { theme } from "../theme/theme";

import DailyCockpitScreen from "../features/cockpit/screens/DailyCockpitScreen";
import HabitsListScreen from "../features/habits/screens/HabitsListScreen";
import CategoriesScreen from "../features/categories/screens/CategoriesScreen";
import TaskListScreen from "../features/tasks/screens/TaskListScreen";
import GoalsListScreen from "../features/goals/screens/GoalsListScreen";
import GoalDetailScreen from "../features/goals/screens/GoalDetailScreen";
import BacklogScreen from "../features/backlog/screens/BacklogScreen";

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const TodayStack = createNativeStackNavigator();

const TodayStackNavigator = () => (
  <TodayStack.Navigator screenOptions={{ headerShown: false }}>
    <TodayStack.Screen name="Cockpit" component={DailyCockpitScreen} />
    <TodayStack.Screen
      name="TaskList"
      component={TaskListScreen}
      options={{
        headerShown: true,
        headerTitle: "All Tasks",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <TodayStack.Screen
      name="HabitsList"
      component={HabitsListScreen}
      options={{
        headerShown: true,
        headerTitle: "Habits",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <TodayStack.Screen
      name="Backlog"
      component={BacklogScreen}
      options={{
        headerShown: true,
        headerTitle: "Backlog",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
  </TodayStack.Navigator>
);

const MoreStackNavigator = () => (
  <MoreStack.Navigator>
    <MoreStack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{
        headerTitle: "Categories",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <MoreStack.Screen
      name="GoalsList"
      component={GoalsListScreen}
      options={{
        headerTitle: "Goals",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <MoreStack.Screen
      name="HabitsList"
      component={HabitsListScreen}
      options={{
        headerTitle: "Habits",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <MoreStack.Screen
      name="GoalDetail"
      component={GoalDetailScreen}
      options={{
        headerTitle: "Goal",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
    <MoreStack.Screen
      name="Backlog"
      component={BacklogScreen}
      options={{
        headerTitle: "Backlog",
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    />
  </MoreStack.Navigator>
);

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Today: "☀️",
    Backlog: "📥",
    More: "⋯",
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || "•"}
    </Text>
  );
};

const RootNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        paddingBottom: 4,
        height: 56,
      },
      tabBarLabelStyle: {
        fontSize: theme.fontSize.xs,
        fontWeight: "600",
      },
    })}
  >
    <Tab.Screen name="Today" component={TodayStackNavigator} />
    <Tab.Screen name="Backlog" component={BacklogScreen} />
    <Tab.Screen name="More" component={MoreStackNavigator} />
  </Tab.Navigator>
);

export default RootNavigator;
