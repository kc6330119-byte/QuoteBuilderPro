export type EngineQuestionType = "NUMBER" | "SELECT" | "BOOLEAN" | "TEXT";

export type VisibilityCondition = {
  questionId: string;
  operator: "equals" | "checked";
  value: string | number | boolean | null;
};

export type EngineQuestion = {
  id: string;
  label: string;
  questionType: EngineQuestionType;
  options?: string[];
  isRequired?: boolean;
  visibilityCondition?: VisibilityCondition | null;
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
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const questionIds = new Set(visibleQuestions.map((question) => question.id));

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

export function getVisibleQuestions<T extends EngineQuestion>(questions: T[], answers: QuoteAnswers) {
  const visibleQuestionIds = new Set<string>();

  return questions.filter((question) => {
    const condition = normalizeVisibilityCondition(question.visibilityCondition);

    if (!condition) {
      visibleQuestionIds.add(question.id);
      return true;
    }

    if (!visibleQuestionIds.has(condition.questionId)) {
      return false;
    }

    const visible = matchesVisibilityCondition(condition, answers[condition.questionId]);
    if (visible) {
      visibleQuestionIds.add(question.id);
    }

    return visible;
  });
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

export function normalizeVisibilityCondition(config: unknown): VisibilityCondition | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }

  const value = config as Record<string, unknown>;
  const questionId = value.questionId;
  const operator = value.operator;

  if (typeof questionId !== "string" || questionId.trim().length === 0) {
    return null;
  }

  if (operator === "checked") {
    return {
      questionId,
      operator: "checked",
      value: true
    };
  }

  if (operator === "equals") {
    return {
      questionId,
      operator: "equals",
      value:
        typeof value.value === "string" || typeof value.value === "number" || typeof value.value === "boolean"
          ? value.value
          : null
    };
  }

  return null;
}

function matchesVisibilityCondition(condition: VisibilityCondition, answer: QuoteAnswers[string]) {
  if (condition.operator === "checked") {
    return answer === true || answer === "true" || answer === "on";
  }

  return String(answer ?? "") === String(condition.value ?? "");
}
