export type WorkshopStatus = "draft" | "uploaded" | "analyzed";

export type Stage = "a" | "b" | "c";

export interface QuestionRef {
  key: string;
  text: string;
}

export interface DimensionMatch {
  id: string;
  name: string;
  a: QuestionRef;
  b: QuestionRef;
  c: QuestionRef;
}

export interface Workshop {
  id: string;
  name: string;
  cohort: string;
  location: string;
  date: string;
  description: string;
  status: WorkshopStatus;
  aUploadedAt: string | null;
  bUploadedAt: string | null;
  cUploadedAt: string | null;
  analyzedAt: string | null;
  aCount: number;
  bCount: number;
  cCount: number;
  matchedCount: number;
  createdAt: string;
}

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
  value?: number;
  [key: string]: string | number | undefined;
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

export type AnswerValue = number | string | string[];

export interface ParticipantRecord {
  participantId: string;
  name: string | null;
  answers: {
    a: Record<string, AnswerValue>;
    b: Record<string, AnswerValue>;
    c: Record<string, AnswerValue>;
  };
}

export interface TopicMetric {
  topic: string;
  a: number;
  b: number;
  c: number;
  misconception: number;
  gain: number;
  insight: string;
}

export interface AnalyticsSnapshot {
  workshopId?: string;
  participants: number;
  completedSurveys: number;
  dimensions: TopicMetric[];
  workshopImpactScore: number;
  learningGainIndex: number;
  misconceptionCorrectionIndex: number;
  dimensionGrowth: number;
  overallSatisfaction: number | null;
  misconceptionInsights: InsightData[];
  learningGainInsights: InsightData[];
  skills: Array<{ name: string; value: number }>;
  activities: Array<{
    name: string;
    rating: number;
    category: string;
    description: string;
  }>;
  facilitator: {
    averageRating: number | null;
    safeEnvironment: number | null;
    clearInstructions: number | null;
    suggestions: string[];
  } | null;
  collaboration: {
    ideasHeard: number | null;
    respect: number | null;
    teamPreference: number | null;
    strengths: string[];
    challenges: string[];
  } | null;
  educatorInsights: string[];
}

export interface ParticipantData {
  name: string;
  preWorkshop: Record<string, number>;
  retrospective: Record<string, number>;
  postWorkshop: Record<string, number>;
  overallGrowth: number;
}
