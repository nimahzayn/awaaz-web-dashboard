export type WorkshopStatus = "draft" | "uploaded" | "analyzed";

export interface Workshop {
  id: string;
  name: string;
  cohort: string;
  location: string;
  date: string;
  description: string;
  status: WorkshopStatus;
  preUploadedAt: string | null;
  postUploadedAt: string | null;
  analyzedAt: string | null;
  preCount: number;
  postCount: number;
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

export interface SurveyResponse {
  email: string;
  pre: {
    q5: Record<string, number>;
    q7: number;
    q8: number;
    q11: number;
  };
  post: {
    q12: number;
    q14: Record<string, number>;
    q15: Record<string, number>;
    q18: number;
    q19: number;
    q21: number;
    q22: number;
    ideasHeard: number;
    respect: number;
    teamPreference: number;
    strengths: string[];
    challenges: string[];
    teamValues: string[];
    visioningExercise: string[];
    clayActivity: number;
    sixW2h: number;
    riverOfLife: number;
    aiActivity: number;
    gameActivity: number;
    laptopActivity: number;
    fieldActivity: number;
    feelingsChart: number;
    caseStudy: number;
    interventionPlanning: number;
    facilitatorRating: number;
    safeLearningEnvironment: number;
    clearInstructions: number;
    leadership: number;
    criticalThinking: number;
    empathy: number;
    problemSolving: number;
    communication: number;
    justiceUnderstanding: number;
    overallSatisfaction: number;
    suggestions: string[];
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
  workshopImpactScore: number;
  learningGainIndex: number;
  misconceptionCorrectionIndex: number;
  identityGrowth: number;
  problemSolvingGrowth: number;
  overallSatisfaction: number;
  identityTopics: TopicMetric[];
  creativePedagogy: TopicMetric;
  problemSolving: TopicMetric;
  citizenSensitivity: {
    before: number;
    after: number;
    change: number;
  };
  misconceptionInsights: InsightData[];
  learningGainInsights: InsightData[];
  teamCollaboration: {
    ideasHeard: number;
    respect: number;
    teamPreference: number;
    strengths: string[];
    challenges: string[];
    teamValues: string[];
    visioningExercise: string[];
  };
  activities: Array<{
    name: string;
    rating: number;
    category: string;
    description: string;
  }>;
  skills: Array<{ name: string; value: number }>;
  facilitator: {
    averageRating: number;
    safeEnvironment: number;
    clearInstructions: number;
    suggestions: string[];
  };
  educatorInsights: string[];
}

export interface ParticipantData {
  name: string;
  preWorkshop: Record<string, number>;
  retrospective: Record<string, number>;
  postWorkshop: Record<string, number>;
  overallGrowth: number;
}
