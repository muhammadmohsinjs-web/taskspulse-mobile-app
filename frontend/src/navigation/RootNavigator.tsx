import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme/theme";
import { AppIcon, icons } from "../components/ui/Icon";

interface OnboardingContextValue {
  restartOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
};

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
import WeeklyPlanningScreen from "../features/planning/screens/WeeklyPlanningScreen";
import SettingsScreen from "../features/settings/screens/SettingsScreen";
import MoreScreen from "../features/more/screens/MoreScreen";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen";

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const TodayStack = createNativeStackNavigator();
const CalendarStack = createNativeStackNavigator();
const GoalsStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const ONBOARDING_KEY = "@taskspulse_has_seen_onboarding";

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

const GoalsStackNavigator = () => (
  <GoalsStack.Navigator>
    <GoalsStack.Screen
      name="GoalsList"
      component={GoalsListScreen}
      options={{ headerShown: false }}
    />
    <GoalsStack.Screen
      name="GoalDetail"
      component={GoalDetailScreen}
      options={{ ...stackScreenOptions, headerTitle: "Goal" }}
    />
  </GoalsStack.Navigator>
);

const MoreStackNavigator = () => (
  <MoreStack.Navigator>
    <MoreStack.Screen
      name="MoreHome"
      component={MoreScreen}
      options={{ headerShown: false }}
    />
    <MoreStack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{ ...stackScreenOptions, headerTitle: "Categories" }}
    />
    <MoreStack.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ ...stackScreenOptions, headerTitle: "Analytics" }}
    />
    <MoreStack.Screen
      name="WeeklyPlanning"
      component={WeeklyPlanningScreen}
      options={{ ...stackScreenOptions, headerTitle: "Weekly Planning" }}
    />
    <MoreStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ ...stackScreenOptions, headerTitle: "Settings" }}
    />
  </MoreStack.Navigator>
);

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const iconMap: Record<string, keyof typeof icons> = {
    Today: "home",
    Calendar: "calendar",
    Backlog: "archive",
    Goals: "goal",
    More: "more",
  };
  const iconName = iconMap[label];
  if (!iconName) return null;
  return (
    <AppIcon
      name={icons[iconName]}
      size={focused ? 24 : 22}
      color={focused ? theme.colors.primary : theme.colors.textMuted}
    />
  );
};

const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasSeenOnboarding(value === "true");
      } catch {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Silently fail - user can still proceed
    }
    setHasSeenOnboarding(true);
  };

  const restartOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch {
      // Silently fail
    }
    setHasSeenOnboarding(false);
  }, []);

  // Show loading while checking onboarding status
  if (hasSeenOnboarding === null) {
    return null;
  }

  return (
    <OnboardingContext.Provider value={{ restartOnboarding }}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onGetStarted={handleGetStarted}
              />
            )}
          </RootStack.Screen>
        ) : (
          <RootStack.Screen name="MainApp">
            {() => (
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  headerShown: false,
                  tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
                  tabBarActiveTintColor: theme.colors.primary,
                  tabBarInactiveTintColor: theme.colors.textMuted,
                  tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 6 + insets.bottom,
                    paddingTop: 6,
                    height: 64 + insets.bottom,
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
                <Tab.Screen name="Goals" component={GoalsStackNavigator} />
                <Tab.Screen name="More" component={MoreStackNavigator} />
              </Tab.Navigator>
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </OnboardingContext.Provider>
  );
};

export default RootNavigator;
