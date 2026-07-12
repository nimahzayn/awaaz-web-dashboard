import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Users,
  Sparkles,
  Star,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Workshop Overview",
    href: "/workshop-overview",
    icon: LayoutDashboard,
    description: "Executive overview of workshop impact",
  },
  {
    title: "Learning Journey",
    href: "/learning-journey",
    icon: Compass,
    description: "A → B → C understanding progression",
  },
  {
    title: "Knowledge Growth",
    href: "/knowledge-growth",
    icon: GraduationCap,
    description: "Measure knowledge growth across topics",
  },
  {
    title: "Team Collaboration",
    href: "/team-collaboration",
    icon: Users,
    description: "Team dynamics and collaboration insights",
  },
  {
    title: "Activity Impact",
    href: "/activity-impact",
    icon: Sparkles,
    description: "Rank and evaluate workshop activities",
  },
  {
    title: "Facilitation Insights",
    href: "/facilitation-insights",
    icon: Star,
    description: "Facilitator ratings and feedback",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform preferences and research context",
  },
];
