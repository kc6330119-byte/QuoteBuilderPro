export type EngineQuestionType = "NUMBER" | "SELECT" | "BOOLEAN" | "TEXT";

export type EngineQuestion = {
  id: string;
  label: string;
  questionType: EngineQuestionType;
  options?: string[];
  isRequired?: boolean;
};

export type EnginePricingRule = {
  id?: string;
  questionId?: string | null;
  ruleType: string;
  ruleConfig?: unknown;
  amount: number;
};

export type QuoteAnswers = Record<string, string | number | boolean | null | undefined>;

export function calculateQuote(questions: EngineQuestion[], rules: EnginePricingRule[], answers: QuoteAnswers) {
  const questionIds = new Set(questions.map((question) => question.id));

  return rules.reduce((total, rule) => {
    const ruleType = normalizeRuleType(rule.ruleType);
    const questionId = rule.questionId ?? getConfigString(rule.ruleConfig, "questionId");
    const answer = questionId && questionIds.has(questionId) ? answers[questionId] : undefined;

    if (ruleType === "base_price") {
      return total + rule.amount;
    }

    if (ruleType === "quantity_multiplier") {
      return total + Number(answer || 0) * rule.amount;
    }

    if (ruleType === "option_price") {
      const selectedOption = getConfigString(rule.ruleConfig, "option");
      if (!selectedOption) {
        return answer ? total + rule.amount : total;
      }

      return String(answer) === selectedOption ? total + rule.amount : total;
    }

    if (ruleType === "checkbox_addon") {
      return answer === true || answer === "true" ? total + rule.amount : total;
    }

    return total;
  }, 0);
}

export function normalizeRuleType(ruleType: string) {
  if (ruleType === "BASE_PRICE") return "base_price";
  if (ruleType === "QUESTION_AMOUNT") return "quantity_multiplier";

  return ruleType.toLowerCase();
}

export function getConfigString(config: unknown, key: string) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }

  const value = (config as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
