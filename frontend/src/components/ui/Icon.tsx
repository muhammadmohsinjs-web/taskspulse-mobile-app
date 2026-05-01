import React from "react";
import { View } from "react-native";
import {
  AlertTriangle,
  ClipboardList,
  PenLine,
  Target,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
  Search,
  Tag,
  ListChecks,
  Sun,
  Inbox,
  MoreHorizontal,
  ChevronRight,
  Check,
  X,
  Zap,
  Sprout,
  PartyPopper,
  FileText,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Menu,
  Bell,
  Flag,
  Clock,
  User,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react-native";
import { theme } from "../../theme/theme";

export type IconName =
  | "warning"
  | "clipboard"
  | "edit"
  | "target"
  | "calendar"
  | "sparkles"
  | "chart"
  | "settings"
  | "search"
  | "tag"
  | "list"
  | "sun"
  | "inbox"
  | "more"
  | "chevron"
  | "check"
  | "x"
  | "zap"
  | "sprout"
  | "party"
  | "file"
  | "arrowLeft"
  | "arrowRight"
  | "mail"
  | "lock"
  | "eye"
  | "eyeOff"
  | "menu"
  | "bell"
  | "flag"
  | "clock"
  | "user"
  | "checkCircle";

const ICON_MAP: Record<IconName, LucideIcon> = {
  warning: AlertTriangle,
  clipboard: ClipboardList,
  edit: PenLine,
  target: Target,
  calendar: Calendar,
  sparkles: Sparkles,
  chart: BarChart3,
  settings: Settings,
  search: Search,
  tag: Tag,
  list: ListChecks,
  sun: Sun,
  inbox: Inbox,
  more: MoreHorizontal,
  chevron: ChevronRight,
  check: Check,
  x: X,
  zap: Zap,
  sprout: Sprout,
  party: PartyPopper,
  file: FileText,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  menu: Menu,
  bell: Bell,
  flag: Flag,
  clock: Clock,
  user: User,
  checkCircle: CheckCircle2,
};

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 20, color }) => {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} color={color || theme.colors.textPrimary} />;
};

interface IconCircleProps {
  name: IconName;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const IconCircle: React.FC<IconCircleProps> = ({
  name,
  size = 20,
  color,
  backgroundColor,
}) => (
  <View
    style={{
      width: size * 2,
      height: size * 2,
      borderRadius: size,
      backgroundColor: backgroundColor || theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <AppIcon name={name} size={size} color={color} />
  </View>
);

export const icons = {
  warning: "warning" as IconName,
  clipboard: "clipboard" as IconName,
  edit: "edit" as IconName,
  target: "target" as IconName,
  calendar: "calendar" as IconName,
  sparkles: "sparkles" as IconName,
  chart: "chart" as IconName,
  settings: "settings" as IconName,
  search: "search" as IconName,
  tag: "tag" as IconName,
  list: "list" as IconName,
  sun: "sun" as IconName,
  inbox: "inbox" as IconName,
  more: "more" as IconName,
  chevron: "chevron" as IconName,
  check: "check" as IconName,
  x: "x" as IconName,
  zap: "zap" as IconName,
  sprout: "sprout" as IconName,
  party: "party" as IconName,
  file: "file" as IconName,
  arrowLeft: "arrowLeft" as IconName,
  arrowRight: "arrowRight" as IconName,
  mail: "mail" as IconName,
  lock: "lock" as IconName,
  eye: "eye" as IconName,
  eyeOff: "eyeOff" as IconName,
  menu: "menu" as IconName,
  bell: "bell" as IconName,
  flag: "flag" as IconName,
  clock: "clock" as IconName,
  user: "user" as IconName,
  checkCircle: "checkCircle" as IconName,
};
