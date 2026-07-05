import { BRAND_COLORS } from "./colors";
import type {
  ActivityData,
  ChartDataPoint,
  FacilitatorData,
  IdentityDimensionData,
  InsightData,
  MetricData,
  ReportData,
  ThemeData,
} from "@/types";

export const PLACEHOLDER_WORKSHOP = {
  name: "Justice Innovation Workshop",
  cohort: "Leadership Labs Cohort 2025",
  date: "March 2025",
  location: "Mumbai",
  participants: 42,
};

export const DASHBOARD_METRICS: MetricData[] = [
  {
    id: "participants",
    label: "Total Participants",
    value: 42,
    description: "Students who attended the workshop",
    trend: "neutral",
    color: BRAND_COLORS.blue,
  },
  {
    id: "surveys",
    label: "Completed Surveys",
    value: "38 / 42",
    description: "Pre and post workshop responses",
    trend: "up",
    trendLabel: "90% completion",
    color: BRAND_COLORS.green,
  },
  {
    id: "impact",
    label: "Workshop Impact Score",
    value: "—",
    description: "Composite impact measure (pending)",
    color: BRAND_COLORS.primary,
  },
  {
    id: "learning-gain",
    label: "Learning Gain Index",
    value: "—",
    description: "Average knowledge growth (pending)",
    color: BRAND_COLORS.purple,
  },
  {
    id: "misconception",
    label: "Misconception Correction Index",
    value: "—",
    description: "Shift from misconceptions (pending)",
    color: BRAND_COLORS.coral,
  },
  {
    id: "workshop-rating",
    label: "Workshop Rating",
    value: "4.2 / 5",
    description: "Average participant rating",
    trend: "up",
    color: BRAND_COLORS.yellow,
  },
  {
    id: "facilitator-rating",
    label: "Facilitator Rating",
    value: "4.5 / 5",
    description: "Average facilitator evaluation",
    trend: "up",
    color: BRAND_COLORS.lime,
  },
];

export const ABC_STAGES = [
  {
    stage: "A" as const,
    label: "Original Before",
    description:
      "Participant understanding before the workshop, as recalled at the start of the session.",
    value: 3.2,
  },
  {
    stage: "B" as const,
    label: "Retrospective Before",
    description:
      "Revised understanding of pre-workshop knowledge after experiencing the workshop content.",
    value: 2.4,
  },
  {
    stage: "C" as const,
    label: "After Workshop",
    description:
      "Current understanding after completing the Justice Innovation workshop.",
    value: 4.1,
  },
];

export const LEARNING_IMPACT_GROUPED: ChartDataPoint[] = [
  { name: "Justice Concepts", A: 2.8, B: 2.1, C: 4.2 },
  { name: "Identity Awareness", A: 3.1, B: 2.5, C: 3.9 },
  { name: "Systemic Thinking", A: 2.5, B: 1.9, C: 4.0 },
  { name: "Empathy & Listening", A: 3.4, B: 2.8, C: 4.3 },
  { name: "Action Orientation", A: 2.9, B: 2.3, C: 3.8 },
];

export const SLOPE_CHART_DATA = [
  { participant: "P1", before: 2.5, after: 4.0 },
  { participant: "P2", before: 3.0, after: 4.2 },
  { participant: "P3", before: 2.8, after: 3.9 },
  { participant: "P4", before: 3.2, after: 4.5 },
  { participant: "P5", before: 2.1, after: 3.7 },
  { participant: "P6", before: 3.5, after: 4.1 },
  { participant: "P7", before: 2.9, after: 4.0 },
  { participant: "P8", before: 3.1, after: 3.8 },
];

export const MISCONCEPTION_INSIGHTS: InsightData[] = [
  {
    id: "m1",
    title: "Caste as individual prejudice only",
    description:
      "Many participants initially viewed caste discrimination as personal bias rather than a structural system.",
    type: "attention",
    tag: "Common misconception",
  },
  {
    id: "m2",
    title: "Gender equality achieved in urban areas",
    description:
      "Participants often assumed urban settings have resolved gender inequality issues.",
    type: "attention",
    tag: "Geographic bias",
  },
  {
    id: "m3",
    title: "Religious harmony through tolerance",
    description:
      "Understanding shifted from passive tolerance to active solidarity and justice.",
    type: "positive",
    tag: "Shift observed",
  },
];

export const MISCONCEPTION_RANKINGS: ChartDataPoint[] = [
  { name: "Caste System", value: 28 },
  { name: "Gender Roles", value: 22 },
  { name: "Religious Bias", value: 18 },
  { name: "Class Privilege", value: 15 },
  { name: "Media Narratives", value: 12 },
];

export const LEARNING_GAIN_TOPICS: ChartDataPoint[] = [
  { name: "Structural Injustice", gain: 1.8 },
  { name: "Intersectionality", gain: 1.5 },
  { name: "Privilege Awareness", gain: 1.4 },
  { name: "Community Action", gain: 1.2 },
  { name: "Policy Understanding", gain: 0.9 },
];

export const HEATMAP_DATA = [
  { topic: "Caste", week1: 2.1, week2: 2.8, week3: 3.5, week4: 4.0 },
  { topic: "Gender", week1: 2.5, week2: 3.0, week3: 3.6, week4: 3.9 },
  { topic: "Religion", week1: 2.0, week2: 2.6, week3: 3.2, week4: 3.7 },
  { topic: "Class", week1: 2.3, week2: 2.9, week3: 3.4, week4: 3.8 },
  { topic: "Disability", week1: 1.8, week2: 2.4, week3: 3.0, week4: 3.5 },
];

export const TEAM_COLLABORATION_METRICS: MetricData[] = [
  {
    id: "ideas-heard",
    label: "Ideas Heard",
    value: "4.1 / 5",
    description: "Participants felt their ideas were valued",
    color: BRAND_COLORS.blue,
  },
  {
    id: "diverse-perspectives",
    label: "Diverse Perspectives",
    value: "4.3 / 5",
    description: "Exposure to different viewpoints",
    color: BRAND_COLORS.purple,
  },
  {
    id: "teamwork",
    label: "Teamwork Preference",
    value: "3.8 / 5",
    description: "Comfort with collaborative work",
    color: BRAND_COLORS.green,
  },
];

export const LIKERT_DATA: ChartDataPoint[] = [
  { name: "Strongly Disagree", value: 2 },
  { name: "Disagree", value: 5 },
  { name: "Neutral", value: 8 },
  { name: "Agree", value: 18 },
  { name: "Strongly Agree", value: 12 },
];

export const TEAM_CHALLENGES: InsightData[] = [
  {
    id: "tc1",
    title: "Dominant voices in discussions",
    description: "Some groups noted uneven participation during brainstorming.",
    type: "attention",
  },
  {
    id: "tc2",
    title: "Time management in activities",
    description: "Groups wanted more time for deeper dialogue.",
    type: "neutral",
  },
];

export const TEAM_STRENGTHS: InsightData[] = [
  {
    id: "ts1",
    title: "Active listening practices",
    description: "Teams reported improved listening after structured exercises.",
    type: "positive",
  },
  {
    id: "ts2",
    title: "Cross-group empathy",
    description: "Participants connected personal stories to broader justice themes.",
    type: "positive",
  },
];

export const WORD_CLOUD_WORDS = [
  { text: "listening", size: 32 },
  { text: "empathy", size: 28 },
  { text: "justice", size: 36 },
  { text: "community", size: 24 },
  { text: "respect", size: 22 },
  { text: "collaboration", size: 26 },
  { text: "understanding", size: 30 },
  { text: "inclusion", size: 20 },
  { text: "voice", size: 24 },
  { text: "solidarity", size: 18 },
];

export const IDENTITY_DIMENSIONS: IdentityDimensionData[] = [
  {
    id: "caste",
    dimension: "Caste",
    before: 2.8,
    reflection: 2.1,
    after: 4.0,
    description: "Understanding of caste as a structural system of inequality",
  },
  {
    id: "gender",
    dimension: "Gender",
    before: 3.2,
    reflection: 2.6,
    after: 4.1,
    description: "Awareness of gender norms and intersectional experiences",
  },
  {
    id: "religion",
    dimension: "Religion",
    before: 2.9,
    reflection: 2.3,
    after: 3.8,
    description: "Understanding religious diversity and communal harmony",
  },
];

export const TOP_ACTIVITIES: ActivityData[] = [
  {
    id: "a1",
    name: "Story Circle",
    rating: 4.8,
    rank: 1,
    category: "Dialogue",
    description: "Personal narrative sharing in small groups",
  },
  {
    id: "a2",
    name: "Privilege Walk",
    rating: 4.6,
    rank: 2,
    category: "Experiential",
    description: "Physical activity demonstrating systemic privilege",
  },
  {
    id: "a3",
    name: "Justice Mapping",
    rating: 4.5,
    rank: 3,
    category: "Analysis",
    description: "Mapping local justice issues in communities",
  },
];

export const BOTTOM_ACTIVITIES: ActivityData[] = [
  {
    id: "a4",
    name: "Lecture Segment",
    rating: 3.2,
    rank: 8,
    category: "Instruction",
    description: "Traditional presentation on justice theory",
  },
  {
    id: "a5",
    name: "Written Reflection",
    rating: 3.5,
    rank: 7,
    category: "Individual",
    description: "Solo journaling exercise",
  },
];

export const RADAR_DATA = [
  { subject: "Engagement", score: 85 },
  { subject: "Clarity", score: 78 },
  { subject: "Relevance", score: 92 },
  { subject: "Discussion", score: 88 },
  { subject: "Application", score: 75 },
  { subject: "Inclusion", score: 90 },
];

export const SKILLS_DEVELOPED: ChartDataPoint[] = [
  { name: "Critical Thinking", value: 38 },
  { name: "Empathetic Listening", value: 35 },
  { name: "Collaboration", value: 32 },
  { name: "Self-Reflection", value: 30 },
  { name: "Public Speaking", value: 22 },
  { name: "Research Skills", value: 18 },
];

export const JUSTICE_THEMES: ThemeData[] = [
  {
    id: "t1",
    title: "Structural Inequality",
    count: 24,
    description: "Recognizing systemic barriers beyond individual actions",
    color: BRAND_COLORS.primary,
  },
  {
    id: "t2",
    title: "Intersectionality",
    count: 19,
    description: "Understanding overlapping identity-based discrimination",
    color: BRAND_COLORS.purple,
  },
  {
    id: "t3",
    title: "Community Solidarity",
    count: 16,
    description: "Building collective action for justice",
    color: BRAND_COLORS.blue,
  },
  {
    id: "t4",
    title: "Policy & Governance",
    count: 12,
    description: "Connecting lived experience to institutional change",
    color: BRAND_COLORS.coral,
  },
];

export const OPEN_ENDED_RESPONSES = [
  "The workshop helped me see how my own experiences connect to larger systems of injustice.",
  "I never realized how much I didn't know about caste until we did the retrospective exercise.",
  "The Story Circle activity was the most powerful — hearing others' experiences changed my perspective.",
  "I want to continue building ideas with my team and take action in our school community.",
];

export const FACILITATORS: FacilitatorData[] = [
  {
    id: "f1",
    name: "Gauri",
    role: "Lead Facilitator",
    rating: 4.7,
    comments: [
      "Created a safe space for difficult conversations",
      "Excellent at guiding discussions without imposing views",
    ],
    suggestions: [
      "More time for one-on-one check-ins",
      "Additional resources on caste history",
    ],
  },
  {
    id: "f2",
    name: "Vaishnavi",
    role: "Co-Facilitator",
    rating: 4.5,
    comments: [
      "Very approachable and patient with questions",
      "Great at connecting activities to real-world examples",
    ],
    suggestions: [
      "Include more regional case studies",
      "Extend the privilege walk debrief",
    ],
  },
  {
    id: "f3",
    name: "Rohit",
    role: "Co-Facilitator",
    rating: 4.3,
    comments: [
      "Strong knowledge of justice frameworks",
      "Encouraged quieter participants to share",
    ],
    suggestions: [
      "Slower pacing during complex topics",
      "More visual aids for systemic concepts",
    ],
  },
];

export const WORKSHOP_EXPERIENCE_METRICS: MetricData[] = [
  {
    id: "overall",
    label: "Overall Rating",
    value: "4.2 / 5",
    description: "General workshop satisfaction",
    color: BRAND_COLORS.primary,
  },
  {
    id: "recommend",
    label: "Would Recommend",
    value: "89%",
    description: "Participants who would recommend",
    color: BRAND_COLORS.green,
  },
  {
    id: "continue",
    label: "Continue Building Ideas",
    value: "76%",
    description: "Want to continue justice work",
    color: BRAND_COLORS.blue,
  },
  {
    id: "satisfaction",
    label: "Overall Satisfaction",
    value: "4.0 / 5",
    description: "End-to-end experience rating",
    color: BRAND_COLORS.purple,
  },
];

export const SENTIMENT_DATA: ChartDataPoint[] = [
  { name: "Inspired", value: 32 },
  { name: "Reflective", value: 28 },
  { name: "Motivated", value: 24 },
  { name: "Uncertain", value: 8 },
  { name: "Overwhelmed", value: 5 },
];

export const REPORTS: ReportData[] = [
  {
    id: "r1",
    title: "Executive Summary Report",
    description: "High-level overview of workshop impact metrics and key findings",
    format: "PDF",
    sections: ["KPIs", "Learning Impact", "Recommendations"],
  },
  {
    id: "r2",
    title: "Learning Impact Analysis",
    description: "Detailed A→B→C progression data with visualizations",
    format: "PDF",
    sections: ["ABC Analysis", "Topic Breakdown", "Participant Trends"],
  },
  {
    id: "r3",
    title: "Raw Survey Data Export",
    description: "Complete participant response data for further analysis",
    format: "CSV",
    sections: ["Pre-Workshop", "Post-Workshop", "Metadata"],
  },
  {
    id: "r4",
    title: "Facilitator Feedback Report",
    description: "Consolidated facilitator evaluations and suggestions",
    format: "PDF",
    sections: ["Ratings", "Comments", "Improvement Areas"],
  },
];

export const DASHBOARD_INSIGHTS: InsightData[] = [
  {
    id: "i1",
    title: "Strong engagement in dialogue activities",
    description:
      "Story Circle and small group discussions received the highest participant ratings.",
    type: "positive",
    tag: "Activity insight",
  },
  {
    id: "i2",
    title: "Retrospective shift indicates learning",
    description:
      "B-stage scores lower than A-stage suggests participants revised their pre-workshop understanding.",
    type: "neutral",
    tag: "Learning pattern",
  },
  {
    id: "i3",
    title: "Identity topics need more time",
    description:
      "Participants requested deeper exploration of caste and religious diversity topics.",
    type: "attention",
    tag: "Facilitation note",
  },
];

export const FILTER_WORKSHOPS = [
  { label: "All Workshops", value: "all" },
  { label: "Justice Innovation — March 2025", value: "ji-march-2025" },
  { label: "Leadership Labs — January 2025", value: "ll-jan-2025" },
];

export const FILTER_COHORTS = [
  { label: "All Cohorts", value: "all" },
  { label: "Cohort A", value: "cohort-a" },
  { label: "Cohort B", value: "cohort-b" },
];
