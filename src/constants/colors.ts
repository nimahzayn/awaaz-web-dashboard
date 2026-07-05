export const BRAND_COLORS = {
  primary: "#E7436D",
  dark: "#231F20",
  purple: "#B07AE6",
  blue: "#339CFF",
  coral: "#F08367",
  yellow: "#FFBA4C",
  green: "#44E6AD",
  lime: "#B1E043",
  background: "#FAFAF8",
  surface: "#FFFFFF",
  muted: "#F4F4F2",
  border: "#E8E8E4",
} as const;

export const CHART_COLORS = [
  BRAND_COLORS.primary,
  BRAND_COLORS.purple,
  BRAND_COLORS.blue,
  BRAND_COLORS.coral,
  BRAND_COLORS.yellow,
  BRAND_COLORS.green,
  BRAND_COLORS.lime,
] as const;
