/**
 * Dimension pipeline — maps uploaded A/B/C sheet questions to analytical dimensions.
 *
 * Flow:
 *   Uploaded sheets → extractQuestions → matchDimensions → DimensionMatch[]
 *   Participant records + dimensions → computeAnalytics → AnalyticsSnapshot
 *
 * UI components consume AnalyticsSnapshot only; they never assume fixed question names.
 */

export type { DimensionMatch, QuestionRef, TopicMetric, AnalyticsSnapshot } from "@/types";
export {
  matchDimensions,
  extractQuestions,
  deriveDimensionName,
  questionSimilarity,
} from "@/services/question-matching";
export { computeAnalytics } from "@/services/analytics";
export { getAnalyticsSource } from "@/services/analytics-source";
