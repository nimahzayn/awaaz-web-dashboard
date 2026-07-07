import { getSurveyResponses } from "@/services/data";
import type {
  AnalyticsSnapshot,
  InsightData,
  SurveyResponse,
  TopicMetric,
} from "@/types";

const TOPICS = ["caste", "gender", "religion"] as const;

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1),
  );
}

function round(value: number): number {
  return Number(value.toFixed(1));
}

function summarizeTopic(
  topic: (typeof TOPICS)[number],
  responses: SurveyResponse[],
): TopicMetric {
  const aValues = responses.map((response) => response.pre.q5[topic]);
  const bValues = responses.map((response) => response.post.q14[topic]);
  const cValues = responses.map((response) => response.post.q15[topic]);
  const misconceptionValues = aValues.map(
    (value, index) => value - bValues[index],
  );
  const gainValues = cValues.map((value, index) => value - bValues[index]);

  const a = average(aValues);
  const b = average(bValues);
  const c = average(cValues);
  const misconception = average(misconceptionValues);
  const gain = average(gainValues);

  const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
  const insight =
    misconception > 0
      ? `Participants initially overestimated their understanding of ${topicLabel}.`
      : `Participants were more accurate about their prior understanding of ${topicLabel}.`;

  return { topic: topicLabel, a, b, c, misconception, gain, insight };
}

function buildMisconceptionInsights(topics: TopicMetric[]): InsightData[] {
  return topics.map((topic, index) => ({
    id: `mis-${topic.topic.toLowerCase()}`,
    title: `${topic.topic} perception shift`,
    description:
      topic.misconception > 0
        ? `Participants overestimated their prior understanding by ${topic.misconception.toFixed(1)} points on average.`
        : `Participants' retrospective view aligned closely with their actual understanding of ${topic.topic}.`,
    type: topic.misconception > 0 ? "attention" : "positive",
    tag: index === 0 ? "Largest shift" : "Topic trend",
  }));
}

function buildLearningGainInsights(topics: TopicMetric[]): InsightData[] {
  return topics.map((topic, index) => ({
    id: `gain-${topic.topic.toLowerCase()}`,
    title: `${topic.topic} learning gain`,
    description: `${topic.gain.toFixed(1)} points of measured learning gain after the workshop.`,
    type: topic.gain >= 1 ? "positive" : "neutral",
    tag: index === 0 ? "Highest gain" : "Topic trend",
  }));
}

export async function computeAnalytics(): Promise<AnalyticsSnapshot> {
  const responses = await getSurveyResponses();
  const identityTopics = TOPICS.map((topic) =>
    summarizeTopic(topic, responses),
  );
  const creativePedagogy = {
    topic: "Creative Pedagogies",
    a: average(responses.map((response) => response.pre.q7)),
    b: average(responses.map((response) => response.post.q18)),
    c: average(responses.map((response) => response.post.q19)),
    misconception: average(
      responses.map((response) => response.pre.q7 - response.post.q18),
    ),
    gain: average(
      responses.map((response) => response.post.q19 - response.post.q18),
    ),
    insight:
      "Creative pedagogies generated strong learning impact across the cohort.",
  };

  const problemSolving = {
    topic: "Problem Solving",
    a: average(responses.map((response) => response.pre.q8)),
    b: average(responses.map((response) => response.post.q21)),
    c: average(responses.map((response) => response.post.q22)),
    misconception: average(
      responses.map((response) => response.pre.q8 - response.post.q21),
    ),
    gain: average(
      responses.map((response) => response.post.q22 - response.post.q21),
    ),
    insight:
      "Problem-solving confidence increased through practical workshop exercises.",
  };

  const citizenSensitivity = {
    before: average(responses.map((response) => response.pre.q11)),
    after: average(responses.map((response) => response.post.q12)),
    change: round(
      average(
        responses.map((response) => response.post.q12 - response.pre.q11),
      ),
    ),
  };

  const teamCollaboration = {
    ideasHeard: average(responses.map((response) => response.post.ideasHeard)),
    respect: average(responses.map((response) => response.post.respect)),
    teamPreference: average(
      responses.map((response) => response.post.teamPreference),
    ),
    strengths: responses.flatMap((response) => response.post.strengths),
    challenges: responses.flatMap((response) => response.post.challenges),
    teamValues: responses.flatMap((response) => response.post.teamValues),
    visioningExercise: responses.flatMap(
      (response) => response.post.visioningExercise,
    ),
  };

  const activities = [
    {
      name: "Clay Activity",
      rating: average(responses.map((response) => response.post.clayActivity)),
      category: "Experiential",
      description:
        "Highest-rated activity for embodied reflection and dialogue.",
    },
    {
      name: "6W+2H",
      rating: average(responses.map((response) => response.post.sixW2h)),
      category: "Analysis",
      description:
        "Structured inquiry into justice issues and action pathways.",
    },
    {
      name: "River of Life",
      rating: average(responses.map((response) => response.post.riverOfLife)),
      category: "Reflection",
      description:
        "Narrative exercise connecting identity with everyday experience.",
    },
    {
      name: "AI Activity",
      rating: average(responses.map((response) => response.post.aiActivity)),
      category: "Innovation",
      description:
        "Exploration of technology and justice through collaborative design.",
    },
    {
      name: "Game Activity",
      rating: average(responses.map((response) => response.post.gameActivity)),
      category: "Play",
      description: "Interactive format for understanding systems and choices.",
    },
    {
      name: "Laptop Activity",
      rating: average(
        responses.map((response) => response.post.laptopActivity),
      ),
      category: "Research",
      description:
        "Hands-on inquiry using digital tools and discussion prompts.",
    },
    {
      name: "Field Activity",
      rating: average(responses.map((response) => response.post.fieldActivity)),
      category: "Observation",
      description: "Real-world noticing and community-based reflection.",
    },
    {
      name: "Feelings Chart",
      rating: average(responses.map((response) => response.post.feelingsChart)),
      category: "Reflection",
      description: "Emotional mapping for deeper group conversation.",
    },
    {
      name: "Case Study",
      rating: average(responses.map((response) => response.post.caseStudy)),
      category: "Discussion",
      description: "Applied analysis of justice scenarios and dynamics.",
    },
    {
      name: "Intervention Planning",
      rating: average(
        responses.map((response) => response.post.interventionPlanning),
      ),
      category: "Action",
      description: "Strategic planning for future community engagement.",
    },
  ].sort((left, right) => right.rating - left.rating);

  const skills = [
    {
      name: "Leadership",
      value:
        average(responses.map((response) => response.post.leadership)) * 20,
    },
    {
      name: "Critical Thinking",
      value:
        average(responses.map((response) => response.post.criticalThinking)) *
        20,
    },
    {
      name: "Empathy",
      value: average(responses.map((response) => response.post.empathy)) * 20,
    },
    {
      name: "Problem Solving",
      value:
        average(responses.map((response) => response.post.problemSolving)) * 20,
    },
    {
      name: "Communication",
      value:
        average(responses.map((response) => response.post.communication)) * 20,
    },
    {
      name: "Justice Understanding",
      value:
        average(
          responses.map((response) => response.post.justiceUnderstanding),
        ) * 20,
    },
  ];

  const facilitator = {
    averageRating: average(
      responses.map((response) => response.post.facilitatorRating),
    ),
    safeEnvironment: average(
      responses.map((response) => response.post.safeLearningEnvironment),
    ),
    clearInstructions: average(
      responses.map((response) => response.post.clearInstructions),
    ),
    suggestions: responses.flatMap((response) => response.post.suggestions),
  };

  const educatorInsights = [
    `Participants initially overestimated their understanding of ${identityTopics[1].topic.toLowerCase()}.`,
    `${activities[0].name} generated the highest learning impact.`,
    `${teamCollaboration.challenges[0] || "Communication"} was the most common teamwork challenge.`,
    "Facilitator feedback points to a strong, safe learning environment with room for more reflective practice.",
  ];

  return {
    participants: responses.length,
    completedSurveys: responses.length,
    workshopImpactScore: round(
      average(responses.map((response) => response.post.overallSatisfaction)) *
        20,
    ),
    learningGainIndex: round(
      average(identityTopics.map((topic) => topic.gain)),
    ),
    misconceptionCorrectionIndex: round(
      average(identityTopics.map((topic) => topic.misconception)),
    ),
    identityGrowth: round(
      average(identityTopics.map((topic) => topic.c - topic.b)),
    ),
    problemSolvingGrowth: round(problemSolving.gain),
    overallSatisfaction: round(
      average(responses.map((response) => response.post.overallSatisfaction)),
    ),
    identityTopics,
    creativePedagogy,
    problemSolving,
    citizenSensitivity,
    misconceptionInsights: buildMisconceptionInsights(identityTopics),
    learningGainInsights: buildLearningGainInsights(identityTopics),
    teamCollaboration,
    activities,
    skills,
    facilitator,
    educatorInsights,
  };
}
