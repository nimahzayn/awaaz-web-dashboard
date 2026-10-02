import type { DimensionMatch, QuestionRef } from "@/types";
import { isNameColumn, looksLikePersonNameHeader, normalizeHeader } from "./question-matching";

export { looksLikePersonNameHeader };

const FACILITATOR_COLUMN =
  /facilitator|facilitation|instructor|trainer|mentor|cohost|co-host|support\s+provided\s+by|provided\s+by|how\s+would\s+you\s+rate\s+(?:the\s+)?(?:support|help|guidance|facilitation)/i;

const WORKSHOP_ACTIVITY_SIGNAL =
  /activit|session|exercise|simulation|roleplay|role play|breakout|module|task|game|engagement|clay|river|visioning|case study|intervention|feelings chart|6w|worksheet|drawing|mascot|bingo|laptop|field activit/i;

/** Per-person facilitator ratings (not workshop activities). */
export function isFacilitatorEvaluationQuestion(ref: QuestionRef): boolean {
  const text = String(ref.text ?? "").trim();
  const blob = `${text} ${ref.key}`.replace(/_/g, " ");
  if (FACILITATOR_COLUMN.test(blob)) return true;

  const ratePerson = text.match(
    /(?:^|[\s,])rate\s+(?:the\s+)?([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\b/i
  );
  if (ratePerson && looksLikePersonNameHeader(ratePerson[1])) return true;

  const byPerson = text.match(/\b(?:by|from|for)\s+([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)\b/i);
  if (byPerson && looksLikePersonNameHeader(byPerson[1]) && /rate|rating|support|help|useful|effective/i.test(blob)) {
    return true;
  }

  return false;
}

export function isWorkshopActivityMeasure(ref: QuestionRef): boolean {
  if (!isAnalysisQuestion(ref)) return false;
  if (isFacilitatorEvaluationQuestion(ref)) return false;
  const blob = `${ref.text} ${ref.key}`.replace(/_/g, " ");
  return WORKSHOP_ACTIVITY_SIGNAL.test(blob);
}

/** Final guard: activity label must not be a person name. */
export function isPlausibleActivityDisplayName(name: string): boolean {
  const bare = String(name ?? "")
    .trim()
    .replace(/\s+Activity$/i, "")
    .trim();
  if (!bare || bare.length < 3) return false;
  if (looksLikePersonNameHeader(bare) || looksLikePersonNameHeader(name)) return false;
  if (FACILITATOR_COLUMN.test(name)) return false;
  return true;
}

const METADATA_HEADER =
  /(?:learningoutcomeid|outcomeid|questionid|responseid|submissionid|timestamp|submittedat|responsetime|recordid|uuid|sessionid|formid|surveyid)$/;

const CONTACT_DEMO =
  /(?:phonenumber|phoneno|mobile|cellphone|contactnumber|whatsapp|telephone|phone|emailaddress|email|e-mail|mailaddress|streetaddress|addressline|postalcode|zipcode|zip|city|state|country|schoolname|school|gradelevel|grade|age|gender|dateofbirth|dob|certificate|rollnumber|studentid|employeeid|aadhar|pan)/;

/** Values look like a survey rating (1–10 or 0–100), not IDs or phone numbers. */
export function isPlausibleRatingValues(values: number[]): boolean {
  if (!values.length) return false;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (!Number.isFinite(max) || !Number.isFinite(min)) return false;
  if (min < 0) return false;
  if (max <= 10) return true;
  if (max <= 100 && values.every((v) => v >= 0 && v <= 100)) return true;
  return false;
}

function headerLooksLikeContactOrDemo(text: string, keyNorm: string): boolean {
  const blob = normalizeHeader(`${text}${keyNorm}`);
  if (CONTACT_DEMO.test(blob)) return true;
  if (/^phone/.test(blob) || /phone$/.test(blob)) return true;
  return false;
}

/** Headers suitable for the activity-ratings section (not bare names, facilitators, or generic workshop ratings). */
export function isActivityRatingQuestion(ref: QuestionRef): boolean {
  return isWorkshopActivityMeasure(ref);
}

/** Column is not a survey measure (IDs, metadata, contact/demographic fields). */
export function isAnalysisQuestion(ref: QuestionRef): boolean {
  const text = String(ref.text ?? "").trim();
  const keyNorm = normalizeHeader(ref.key);
  const combined = normalizeHeader(`${ref.key}${text}`);

  if (METADATA_HEADER.test(keyNorm) || METADATA_HEADER.test(combined)) return false;
  if (/^(email|mail|name|participant|respondent|id)$/.test(keyNorm)) return false;
  if (headerLooksLikeContactOrDemo(text, keyNorm)) return false;
  if (isNameColumn(ref.key)) return false;
  if (looksLikePersonNameHeader(text) || looksLikePersonNameHeader(ref.key)) return false;

  if (text && /^\d+$/.test(text) && text.length >= 3) return false;
  if (!text && /^\d+$/.test(ref.key) && ref.key.length >= 3) return false;

  return Boolean(text || ref.key);
}

/** Human-readable label for charts/insights; null if only an identifier is available. */
export function humanMeasureLabel(ref: QuestionRef): string | null {
  if (!isAnalysisQuestion(ref)) return null;

  const text = String(ref.text ?? "").trim();
  if (text && /[a-zA-Z]/.test(text) && !/^\d+$/.test(text)) {
    return shortenLabel(text);
  }

  const key = String(ref.key ?? "").trim();
  if (key && /[a-zA-Z]/.test(key) && !/^\d+$/.test(key)) {
    return shortenLabel(key.replace(/_/g, " "));
  }

  return null;
}

export function resolveDimensionDisplayName(dim: DimensionMatch): string {
  const refs = [dim.a, dim.b, dim.c].filter(Boolean) as QuestionRef[];
  for (const ref of refs) {
    const label = humanMeasureLabel(ref);
    if (label) return label;
  }
  const derived = String(dim.name ?? "").trim();
  if (derived && /[a-zA-Z]/.test(derived) && !/^\d+$/.test(derived)) return derived;
  return "Matched survey measure";
}

function shortenLabel(text: string): string {
  const t = text.trim();
  if (t.length <= 56) return t;
  return `${t.slice(0, 53)}…`;
}

/** Drop topic rows whose stage averages are not valid rating scales. */
export function isPlausibleTopicAverages(a: number, b: number, c: number): boolean {
  const vals = [a, b, c].filter((v) => v > 0);
  if (!vals.length) return false;
  return vals.every((v) => v <= 10) || vals.every((v) => v >= 0 && v <= 100);
}
