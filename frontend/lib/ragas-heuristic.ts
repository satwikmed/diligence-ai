/** Lightweight RAGAS-style scoring without the ragas package (Vercel demo). */

export function heuristicRagasScores(
  question: string,
  answer: string,
  contexts: string[]
): { faithfulness: number; answer_relevancy: number; context_precision: number } {
  const contextText = contexts.join(' ').toLowerCase();
  const answerLower = answer.toLowerCase();
  const questionWords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const relevancyHits = questionWords.filter((w) => answerLower.includes(w)).length;
  const answer_relevancy = Math.min(0.95, 0.55 + relevancyHits * 0.06);

  const precisionHits = contexts.filter((c) =>
    questionWords.some((w) => c.toLowerCase().includes(w))
  ).length;
  const context_precision = Math.min(0.95, 0.45 + precisionHits * 0.12);

  let faithfulness = 0.72;
  if (contexts.length > 0) {
    const snippets = contexts.map((c) => c.slice(0, 80).toLowerCase()).filter((s) => s.length > 40);
    const supported = snippets.some((s) => answerLower.includes(s.slice(0, 40)));
    faithfulness = supported ? 0.9 : 0.78;
    if (contextText && questionWords.some((w) => contextText.includes(w) && answerLower.includes(w))) {
      faithfulness = Math.max(faithfulness, 0.85);
    }
  }

  return {
    faithfulness: Math.round(faithfulness * 100) / 100,
    answer_relevancy: Math.round(answer_relevancy * 100) / 100,
    context_precision: Math.round(context_precision * 100) / 100,
  };
}
