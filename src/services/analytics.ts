import type { AnalyticsSnapshot, SurveyResponse, TopicMetric } from "@/types";
import { readWorkshopFile } from "./workshops";

const TOPICS = ["caste", "gender", "religion"] as const;

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function round(value: number): number {
  return Number(value.toFixed(1));
}

function summarizeTopic(topic: (typeof TOPICS)[number], responses: SurveyResponse[]): TopicMetric {
<<<<<<< HEAD
  const aValues = responses.map((r) => r.pre.q5[topic] as number);
  const bValues = responses.map((r) => r.post.q14[topic] as number);
  const cValues = responses.map((r) => r.post.q15[topic] as number);
=======
  const aValues = responses.map((r) => r.pre.q5[topic]);
  const bValues = responses.map((r) => r.post.q14[topic]);
  const cValues = responses.map((r) => r.post.q15[topic]);
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
  const a = average(aValues);
  const b = average(bValues);
  const c = average(cValues);
  const misconception = average(aValues.map((v, i) => v - bValues[i]));
  const gain = average(cValues.map((v, i) => v - bValues[i]));
  const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    topic: topicLabel,
    a,
    b,
    c,
    misconception,
    gain,
    insight: misconception > 0
      ? `Participants initially overestimated their understanding of ${topicLabel}.`
      : `Participants were more accurate about their prior understanding of ${topicLabel}.`,
  };
}

export async function computeAnalytics(workshopId: string): Promise<AnalyticsSnapshot> {
<<<<<<< HEAD
  const responses: SurveyResponse[] = (await readWorkshopFile(workshopId, "survey_responses.json")) || [];
=======
  const responses: SurveyResponse[] = await readWorkshopFile(workshopId, "survey_responses.json") || [];
>>>>>>> eca607128818d652d280ea17157714cd56e4476f

  const identityTopics = TOPICS.map((topic) => summarizeTopic(topic, responses));

  const creativePedagogy: TopicMetric = {
    topic: "Creative Pedagogies",
    a: average(responses.map((r) => r.pre.q7)),
    b: average(responses.map((r) => r.post.q18)),
    c: average(responses.map((r) => r.post.q19)),
    misconception: average(responses.map((r) => r.pre.q7 - r.post.q18)),
    gain: average(responses.map((r) => r.post.q19 - r.post.q18)),
    insight: "Creative pedagogies generated strong learning impact across the cohort.",
  };

  const problemSolving: TopicMetric = {
    topic: "Problem Solving",
    a: average(responses.map((r) => r.pre.q8)),
    b: average(responses.map((r) => r.post.q21)),
    c: average(responses.map((r) => r.post.q22)),
    misconception: average(responses.map((r) => r.pre.q8 - r.post.q21)),
    gain: average(responses.map((r) => r.post.q22 - r.post.q21)),
    insight: "Problem-solving confidence increased through practical workshop exercises.",
  };

  const citizenSensitivity = {
    before: average(responses.map((r) => r.pre.q11)),
    after: average(responses.map((r) => r.post.q12)),
    change: round(average(responses.map((r) => r.post.q12 - r.pre.q11))),
  };

  const teamCollaboration = {
    ideasHeard: average(responses.map((r) => r.post.ideasHeard)),
    respect: average(responses.map((r) => r.post.respect)),
    teamPreference: average(responses.map((r) => r.post.teamPreference)),
    strengths: responses.flatMap((r) => r.post.strengths),
    challenges: responses.flatMap((r) => r.post.challenges),
    teamValues: responses.flatMap((r) => r.post.teamValues),
    visioningExercise: responses.flatMap((r) => r.post.visioningExercise),
  };

  const activities = [
    { name: "Clay Activity", rating: average(responses.map((r) => r.post.clayActivity)), category: "Experiential", description: "Embodied reflection and dialogue." },
    { name: "6W+2H", rating: average(responses.map((r) => r.post.sixW2h)), category: "Analysis", description: "Structured inquiry into justice issues." },
    { name: "River of Life", rating: average(responses.map((r) => r.post.riverOfLife)), category: "Reflection", description: "Narrative exercise connecting identity." },
    { name: "AI Activity", rating: average(responses.map((r) => r.post.aiActivity)), category: "Innovation", description: "Technology and justice exploration." },
    { name: "Game Activity", rating: average(responses.map((r) => r.post.gameActivity)), category: "Play", description: "Interactive systems understanding." },
    { name: "Laptop Activity", rating: average(responses.map((r) => r.post.laptopActivity)), category: "Research", description: "Digital inquiry tools." },
    { name: "Field Activity", rating: average(responses.map((r) => r.post.fieldActivity)), category: "Observation", description: "Community-based reflection." },
    { name: "Feelings Chart", rating: average(responses.map((r) => r.post.feelingsChart)), category: "Reflection", description: "Emotional mapping exercise." },
    { name: "Case Study", rating: average(responses.map((r) => r.post.caseStudy)), category: "Discussion", description: "Justice scenario analysis." },
    { name: "Intervention Planning", rating: average(responses.map((r) => r.post.interventionPlanning)), category: "Action", description: "Community engagement planning." },
  ].sort((a, b) => b.rating - a.rating);

  const skills = [
    { name: "Leadership", value: average(responses.map((r) => r.post.leadership)) * 20 },
    { name: "Critical Thinking", value: average(responses.map((r) => r.post.criticalThinking)) * 20 },
    { name: "Empathy", value: average(responses.map((r) => r.post.empathy)) * 20 },
    { name: "Problem Solving", value: average(responses.map((r) => r.post.problemSolving)) * 20 },
    { name: "Communication", value: average(responses.map((r) => r.post.communication)) * 20 },
    { name: "Justice Understanding", value: average(responses.map((r) => r.post.justiceUnderstanding)) * 20 },
  ];

  const facilitator = {
    averageRating: average(responses.map((r) => r.post.facilitatorRating)),
    safeEnvironment: average(responses.map((r) => r.post.safeLearningEnvironment)),
    clearInstructions: average(responses.map((r) => r.post.clearInstructions)),
    suggestions: responses.flatMap((r) => r.post.suggestions),
  };

  const educatorInsights = [
    `Participants initially overestimated their understanding of ${identityTopics[1]?.topic.toLowerCase() || "gender"}.`,
    `${activities[0]?.name || "Top activity"} generated the highest learning impact.`,
    `${teamCollaboration.challenges[0] || "Communication"} was the most common teamwork challenge.`,
    "Facilitator feedback points to a strong, safe learning environment with room for more reflective practice.",
  ];

  return {
    workshopId,
    participants: responses.length,
    completedSurveys: responses.length,
    workshopImpactScore: round(average(responses.map((r) => r.post.overallSatisfaction)) * 20),
    learningGainIndex: round(average(identityTopics.map((t) => t.gain))),
<<<<<<< HEAD
    misconceptionCorrectionIndex: round(average(identityTopics.map((t) => t.misconception))),
=======
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
    identityGrowth: round(average(identityTopics.map((t) => t.c - t.b))),
    problemSolvingGrowth: round(problemSolving.gain),
    overallSatisfaction: round(average(responses.map((r) => r.post.overallSatisfaction))),
    identityTopics,
    creativePedagogy,
    problemSolving,
    citizenSensitivity,
<<<<<<< HEAD
    misconceptionInsights: identityTopics.map((t, i) => ({
      id: `misconception-${i}`,
=======
    misconceptionInsights: identityTopics.map((t) => ({
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
      title: `${t.topic} perception shift`,
      description: t.misconception > 0
        ? `Participants overestimated their prior understanding by ${t.misconception.toFixed(1)} points.`
        : `Participants' retrospective view aligned closely with their understanding of ${t.topic}.`,
    })),
<<<<<<< HEAD
    learningGainInsights: identityTopics.map((t, i) => ({
      id: `gain-${i}`,
=======
    learningGainInsights: identityTopics.map((t) => ({
>>>>>>> eca607128818d652d280ea17157714cd56e4476f
      title: `${t.topic} learning gain`,
      description: `${t.gain.toFixed(1)} points of measured learning gain after the workshop.`,
    })),
    teamCollaboration,
    activities,
    skills,
    facilitator,
    educatorInsights,
  };
}
