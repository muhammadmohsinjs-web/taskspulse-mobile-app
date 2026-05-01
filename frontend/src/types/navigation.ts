export type TodayStackParamList = {
  Cockpit: undefined;
  TaskList: undefined;
  HabitsList: undefined;
  Backlog: undefined;
};

export type MoreStackParamList = {
  Categories: undefined;
  GoalsList: undefined;
  HabitsList: undefined;
  GoalDetail: { goalId: string };
  Backlog: undefined;
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
  More: undefined;
};
