export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: string;
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  type?: "positive" | "neutral" | "attention";
  tag?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface FacilitatorData {
  id: string;
  name: string;
  role: string;
  rating: number;
  comments: string[];
  suggestions: string[];
}

export interface ActivityData {
  id: string;
  name: string;
  rating: number;
  rank: number;
  category: string;
  description: string;
}

export interface ThemeData {
  id: string;
  title: string;
  count: number;
  description: string;
  color: string;
}

export interface IdentityDimensionData {
  id: string;
  dimension: string;
  before: number;
  reflection: number;
  after: number;
  description: string;
}

export interface ReportData {
  id: string;
  title: string;
  description: string;
  format: "PDF" | "CSV";
  sections: string[];
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ABCStage {
  stage: "A" | "B" | "C";
  label: string;
  description: string;
  value: number;
}
