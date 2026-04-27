import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/auth";
import { calculators as mockCalculators, leads as mockLeads } from "@/lib/mock-data";
import { getConfigString, normalizeRuleType, type EnginePricingRule, type EngineQuestionType } from "@/lib/quote-engine";

export type CalculatorListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  leads: number;
  conversionRate: number;
  avgQuote: number;
  updatedAt: Date | string;
  questionCount: number;
};

export type LeadListItem = {
  id: string;
  calculatorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerNotes: string | null;
  estimatedPrice: number;
  answersSummary: string;
  createdAt: Date | string;
};

export type QuoteQuestion = {
  id: string;
  label: string;
  questionType: EngineQuestionType;
  options: string[];
  isRequired: boolean;
  sortOrder: number;
};

export type QuotePricingRule = EnginePricingRule;

export type QuoteCalculator = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublished: boolean;
  source: "database" | "mock";
  questions: QuoteQuestion[];
  rules: QuotePricingRule[];
};

export type CalculatorEditor = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublished: boolean;
  questions: QuoteQuestion[];
  rules: Array<QuotePricingRule & { label: string; configLabel: string }>;
};

export async function getOrCreateMockUser() {
  const mockUser = getMockUser();

  return prisma.user.upsert({
    where: { email: mockUser.email },
    update: { name: mockUser.name },
    create: {
      email: mockUser.email,
      name: mockUser.name
    }
  });
}

export async function getCalculatorListItems(): Promise<CalculatorListItem[]> {
  const calculators = await prisma.calculator.findMany({
    include: {
      questions: true,
      submissions: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return calculators.map((calculator) => {
    const quoteTotals = calculator.submissions.map((submission) => Number(submission.estimatedPrice));
    const avgQuote =
      quoteTotals.length > 0 ? quoteTotals.reduce((sum, total) => sum + total, 0) / quoteTotals.length : 0;

    return {
      id: calculator.id,
      name: calculator.name,
      slug: calculator.slug,
      description: calculator.description ?? "No description yet.",
      status: calculator.isPublished ? "PUBLISHED" : "DRAFT",
      leads: calculator.submissions.length,
      conversionRate: 0,
      avgQuote,
      updatedAt: calculator.updatedAt,
      questionCount: calculator.questions.length
    };
  });
}

export async function getDashboardStats() {
  const [calculatorCount, publishedCount, leadCount, leadTotals] = await Promise.all([
    prisma.calculator.count(),
    prisma.calculator.count({ where: { isPublished: true } }),
    prisma.quoteSubmission.count(),
    prisma.quoteSubmission.findMany({ select: { estimatedPrice: true } })
  ]);

  const pipeline = leadTotals.reduce((sum, lead) => sum + Number(lead.estimatedPrice), 0);

  return {
    calculatorCount,
    publishedCount,
    leadCount,
    pipeline
  };
}

export async function getLeadListItems(limit?: number): Promise<LeadListItem[]> {
  const submissions = await prisma.quoteSubmission.findMany({
    include: {
      calculator: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return submissions.map((submission) => ({
    id: submission.id,
    calculatorName: submission.calculator.name,
    customerName: submission.customerName,
    customerEmail: submission.customerEmail,
    customerPhone: submission.customerPhone,
    customerNotes: submission.customerNotes,
    estimatedPrice: Number(submission.estimatedPrice),
    answersSummary: summarizeAnswers(submission.answers),
    createdAt: submission.createdAt
  }));
}

export async function getCalculatorEditorById(id: string): Promise<CalculatorEditor | null> {
  const calculator = await prisma.calculator.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" }
      },
      pricingRules: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!calculator) {
    return null;
  }

  const questions = calculator.questions.map((question) => ({
    id: question.id,
    label: question.label,
    questionType: normalizeQuestionType(question.questionType),
    options: normalizeOptions(question.options),
    isRequired: question.isRequired,
    sortOrder: question.sortOrder
  }));
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  return {
    id: calculator.id,
    name: calculator.name,
    slug: calculator.slug,
    description: calculator.description ?? "",
    isPublished: calculator.isPublished,
    questions,
    rules: calculator.pricingRules.map((rule) => {
      const ruleType = getDisplayRuleType(rule.ruleType, questionMap.get(rule.questionId ?? "")?.questionType);
      const option = getConfigString(rule.ruleConfig, "option");

      return {
        id: rule.id,
        questionId: rule.questionId,
        ruleType,
        ruleConfig: rule.ruleConfig,
        amount: Number(rule.amount),
        label: getRuleLabel(ruleType),
        configLabel: option ? `Option: ${option}` : questionMap.get(rule.questionId ?? "")?.label ?? "No question"
      };
    })
  };
}

export async function getQuoteCalculatorBySlug(slug: string): Promise<QuoteCalculator | null> {
  const calculator = await prisma.calculator.findUnique({
    where: { slug },
    include: {
      questions: {
        include: {
          pricingRules: true
        },
        orderBy: { sortOrder: "asc" }
      },
      pricingRules: true
    }
  });

  if (calculator) {
    const questions = calculator.questions.map((question) => ({
      id: question.id,
      label: question.label,
      questionType: normalizeQuestionType(question.questionType),
      options: normalizeOptions(question.options),
      isRequired: question.isRequired,
      sortOrder: question.sortOrder
    }));
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return {
      id: calculator.id,
      name: calculator.name,
      slug: calculator.slug,
      description: calculator.description ?? "Answer a few questions and receive a working estimate.",
      isPublished: calculator.isPublished,
      source: "database",
      questions,
      rules: calculator.pricingRules.map((rule) => ({
        id: rule.id,
        questionId: rule.questionId,
        ruleType: getDisplayRuleType(rule.ruleType, questionMap.get(rule.questionId ?? "")?.questionType),
        ruleConfig: rule.ruleConfig,
        amount: Number(rule.amount)
      }))
    };
  }

  const mock = mockCalculators.find((item) => item.slug === slug && item.status === "PUBLISHED");
  if (!mock) {
    return null;
  }

  return {
    id: mock.id,
    name: mock.name,
    slug: mock.slug,
    description: mock.description,
    isPublished: true,
    source: "mock",
    questions: mock.fields.map((field, index) => ({
      id: field.id,
      label: field.label,
      questionType:
        field.type === "NUMBER" ? "NUMBER" : field.type === "BOOLEAN" ? "BOOLEAN" : field.type === "SELECT" ? "SELECT" : "TEXT",
      options: field.options?.map((option) => option.label) ?? [],
      isRequired: field.required ?? true,
      sortOrder: index
    })),
    rules: [
      { ruleType: "base_price", amount: mock.basePrice / 100 },
      ...mock.fields.flatMap((field) => {
        if (field.type === "NUMBER") {
          return [{ questionId: field.id, ruleType: "quantity_multiplier", amount: (field.pricePerUnit ?? 0) / 100 }];
        }

        if (field.type === "BOOLEAN") {
          return [{ questionId: field.id, ruleType: "checkbox_addon", amount: (field.priceDelta ?? 0) / 100 }];
        }

        if (field.type === "SELECT") {
          return (
            field.options?.map((option) => ({
              questionId: field.id,
              ruleType: "option_price",
              ruleConfig: { option: option.label },
              amount: option.priceDelta / 100
            })) ?? []
          );
        }

        return [];
      })
    ]
  };
}

export function getMockDashboardFallback() {
  const pipeline = mockLeads.reduce((sum, lead) => sum + lead.totalCents, 0);

  return {
    calculatorCount: mockCalculators.length,
    publishedCount: mockCalculators.filter((calculator) => calculator.status === "PUBLISHED").length,
    leadCount: mockLeads.length,
    pipeline: pipeline / 100
  };
}

function normalizeQuestionType(questionType: string): EngineQuestionType {
  if (questionType === "NUMBER" || questionType === "SELECT" || questionType === "BOOLEAN" || questionType === "TEXT") {
    return questionType;
  }

  return "TEXT";
}

function normalizeOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.filter((option): option is string => typeof option === "string" && option.trim().length > 0);
  }

  return [];
}

function getDisplayRuleType(ruleType: string, questionType?: EngineQuestionType) {
  if (ruleType === "QUESTION_AMOUNT") {
    if (questionType === "BOOLEAN") return "checkbox_addon";
    if (questionType === "SELECT") return "option_price";
    return "quantity_multiplier";
  }

  return normalizeRuleType(ruleType);
}

function getRuleLabel(ruleType: string) {
  if (ruleType === "base_price") return "Base price";
  if (ruleType === "quantity_multiplier") return "Quantity multiplier";
  if (ruleType === "option_price") return "Option price";
  if (ruleType === "checkbox_addon") return "Checkbox add-on";

  return ruleType;
}

function summarizeAnswers(answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return "No answers captured.";
  }

  const values = Object.values(answers as Record<string, unknown>)
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const label = (entry as Record<string, unknown>).label;
      const value = (entry as Record<string, unknown>).value;
      if (typeof label !== "string") return null;

      return `${label}: ${String(value)}`;
    })
    .filter((value): value is string => Boolean(value));

  return values.length > 0 ? values.join(" | ") : "No answers captured.";
}
