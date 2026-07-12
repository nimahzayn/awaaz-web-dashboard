export type WorkshopStatus = "draft" | "uploaded" | "analyzed";
<<<<<<< HEAD

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
=======
>>>>>>> eca607128818d652d280ea17157714cd56e4476f

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
<<<<<<< HEAD
  workshopId?: string;
=======
  workshopId: string;
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  participants: number;
  completedSurveys: number;
  workshopImpactScore: number;
  overallSatisfaction: number;
  learningGainIndex: number;
  identityGrowth: number;
  problemSolvingGrowth: number;
  identityTopics: TopicMetric[];
  creativePedagogy: TopicMetric;
  problemSolving: TopicMetric;
  citizenSensitivity: { before: number; after: number; change: number };
  misconceptionInsights: { title: string; description: string }[];
  learningGainInsights: { title: string; description: string }[];
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
<<<<<<< HEAD
=======

export interface InsightData {
  id: string;
  title: string;
  description: string;
  type: "positive" | "neutral" | "attention";
  tag?: string;
}

export interface SurveyResponse {
  id: string;
  pre: {
    q5: { caste: number; gender: number; religion: number };
    q7: number;
    q8: number;
    q11: number;
  };
  post: {
    q12: number;
    q14: { caste: number; gender: number; religion: number };
    q15: { caste: number; gender: number; religion: number };
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
    leadership: number;
    criticalThinking: number;
    empathy: number;
    problemSolving: number;
    communication: number;
    justiceUnderstanding: number;
    facilitatorRating: number;
    safeLearningEnvironment: number;
    clearInstructions: number;
    overallSatisfaction: number;
    suggestions: string[];
  };
}
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
