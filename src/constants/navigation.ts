import {
  LayoutDashboard,
  Compass,
  Eye,
  GraduationCap,
  Fingerprint,
  Users,
  Sparkles,
  BookOpen,
  Star,
  FileText,
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
    title: "Perception Shift",
    href: "/perception-shift",
    icon: Eye,
    description: "Identify and track misconception correction",
  },
  {
    title: "Knowledge Growth",
    href: "/knowledge-growth",
    icon: GraduationCap,
    description: "Measure knowledge growth across topics",
  },
  {
    title: "Identity Understanding",
    href: "/identity-understanding",
    icon: Fingerprint,
    description: "Caste, gender, and religion perspectives",
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
    title: "Skills & Justice Learning",
    href: "/skills-justice-learning",
    icon: BookOpen,
    description: "Skills developed and justice themes",
  },
  {
    title: "Facilitation Insights",
    href: "/facilitation-insights",
    icon: Star,
    description: "Facilitator ratings and feedback",
  },
  {
    title: "Impact Reports",
    href: "/impact-reports",
    icon: FileText,
    description: "Export PDF and CSV reports",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform preferences and research context",
  },
];
