/** Open-ended columns worth sending for activity mention classification (not demographics/IDs). */
export function isRelevantOpenTextForActivityAnalysis(questionText: string): boolean {
  const t = String(questionText ?? "").trim();
  if (!t || t.length < 8) return false;

  if (
    /phone|email address|certificate name|full name|year of study|school name|roll number|student id|whatsapp|aadhar/i.test(
      t
    ) &&
    !/\bactivit/i.test(t)
  ) {
    return false;
  }

  if (
    /activit|workshop|session|enjoy|useful|effective|which|what.{0,40}(like|help|learn|enjoy)|elaborate|comment|feedback|river|clay|6w|bingo|most effective|hands-on|creative pedagogy|problem solv|field activit|case study|intervention|feelings chart|laptop|drawing-based|game-based|ai-based/i.test(
      t
    )
  ) {
    return true;
  }

  return t.length >= 50 && /\b(learn|understand|justice|challenge|reflect)\b/i.test(t);
}
