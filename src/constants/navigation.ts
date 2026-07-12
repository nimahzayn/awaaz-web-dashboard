import {
  FolderOpen,
  FileText,
  Settings,
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const GLOBAL_NAV: NavItem[] = [
  { title: "Workshops", href: "/workshops", icon: FolderOpen },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const WORKSHOP_NAV: NavItem[] = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard },
  { title: "Insights", href: "/insights", icon: Sparkles },
  { title: "Participants", href: "/participants", icon: Users },
  { title: "Impact Report", href: "/impact-report", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];
