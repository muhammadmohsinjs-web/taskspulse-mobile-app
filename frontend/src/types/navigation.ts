import type { NavigatorScreenParams } from "@react-navigation/native";

export type TodayStackParamList = {
  Cockpit: undefined;
  TaskList: undefined;
  HabitsList: undefined;
  Backlog: undefined;
};

export type GoalsStackParamList = {
  GoalsList: undefined;
  GoalDetail: { goalId: string };
};

export type MoreStackParamList = {
  Categories: undefined;
  Analytics: undefined;
  WeeklyPlanning: undefined;
  Settings: undefined;
};

export type CalendarStackParamList = {
  MonthlyCalendar: undefined;
  DateDetail: { date: string };
};

export type RootTabParamList = {
  Today: undefined;
  Calendar: undefined;
  Backlog: undefined;
  Goals: NavigatorScreenParams<GoalsStackParamList> | undefined;
  More: undefined;
};
