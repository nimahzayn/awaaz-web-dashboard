import {
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Users,
  Fingerprint,
  Trophy,
  BookOpen,
  Star,
  Heart,
  FileText,
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
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Executive overview of workshop impact",
  },
  {
    title: "Learning Impact",
    href: "/learning-impact",
    icon: TrendingUp,
    description: "A → B → C understanding progression",
  },
  {
    title: "Misconception Analysis",
    href: "/misconception-analysis",
    icon: AlertCircle,
    description: "Identify and track misconception correction",
  },
  {
    title: "Learning Gain",
    href: "/learning-gain",
    icon: BarChart3,
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
    title: "Activity Effectiveness",
    href: "/activity-effectiveness",
    icon: Trophy,
    description: "Rank and evaluate workshop activities",
  },
  {
    title: "Skills & Justice Learning",
    href: "/skills-justice-learning",
    icon: BookOpen,
    description: "Skills developed and justice themes",
  },
  {
    title: "Facilitator Evaluation",
    href: "/facilitator-evaluation",
    icon: Star,
    description: "Facilitator ratings and feedback",
  },
  {
    title: "Workshop Experience",
    href: "/workshop-experience",
    icon: Heart,
    description: "Overall satisfaction and sentiment",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Export PDF and CSV reports",
  },
];
