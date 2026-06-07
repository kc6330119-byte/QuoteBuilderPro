import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/auth";
import { getCurrentPeriodStart, getLeadUsage, type LeadUsage } from "@/lib/entitlements";
import {
  getConfigString,
  normalizeRuleType,
  normalizeVisibilityCondition,
  type EnginePricingRule,
  type EngineQuestionType,
  type VisibilityCondition
} from "@/lib/quote-engine";

export type CalculatorListItem = {
  id: string;
  name: string;
  slug: string;
  publicId: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  leads: number;
  conversionRate: number | null;
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
  status: LeadStatus;
  answersSummary: string;
  answerItems: LeadAnswerItem[];
  createdAt: Date | string;
};

export type LeadAnswerItem = {
  label: string;
  value: string;
};

export type LeadStatus = "NEW" | "CONTACTED" | "WON" | "LOST";

export type QuoteQuestion = {
  id: string;
  label: string;
  questionType: EngineQuestionType;
  options: string[];
  isRequired: boolean;
  visibilityCondition: VisibilityCondition | null;
  sortOrder: number;
};

export type QuotePricingRule = EnginePricingRule;

export type CalculatorBranding = {
  displayName: string;
  logoUrl: string | null;
  primaryColor: string;
  introText: string;
  footerText: string | null;
};

export type QuoteCalculator = {
  id: string;
  name: string;
  slug: string;
  publicId: string;
  description: string;
  isPublished: boolean;
  branding: CalculatorBranding;
  questions: QuoteQuestion[];
  rules: QuotePricingRule[];
};

export type CalculatorEditor = {
  id: string;
  name: string;
  slug: string;
  publicId: string;
  description: string;
  isPublished: boolean;
  branding: CalculatorBranding;
  questions: QuoteQuestion[];
  rules: Array<QuotePricingRule & { label: string; configLabel: string; option: string }>;
};

const defaultBrandColor = "#2563eb";

export async function getCalculatorListItems(): Promise<CalculatorListItem[]> {
  const workspace = await getCurrentWorkspace();
  const calculators = await prisma.calculator.findMany({
    where: { companyId: workspace.companyId, isArchived: false },
    include: {
      _count: {
        select: {
          questions: true,
          submissions: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
  const quoteStats =
    calculators.length > 0
      ? await prisma.quoteSubmission.groupBy({
          by: ["calculatorId"],
          where: {
            calculatorId: {
              in: calculators.map((calculator) => calculator.id)
            }
          },
          _avg: {
            estimatedPrice: true
          }
        })
      : [];
  const avgQuoteByCalculatorId = new Map(
    quoteStats.map((stat) => [stat.calculatorId, Number(stat._avg.estimatedPrice ?? 0)])
  );

  return calculators.map((calculator) => {
    return {
      id: calculator.id,
      name: calculator.name,
      slug: calculator.slug,
      publicId: calculator.publicId,
      description: calculator.description ?? "No description yet.",
      status: calculator.isPublished ? "PUBLISHED" : "DRAFT",
      leads: calculator._count.submissions,
      // Lifetime conversion = leads / public views; null until the calculator has been viewed.
      conversionRate:
        calculator.viewCount > 0 ? Math.round((calculator._count.submissions / calculator.viewCount) * 100) : null,
      avgQuote: avgQuoteByCalculatorId.get(calculator.id) ?? 0,
      updatedAt: calculator.updatedAt,
      questionCount: calculator._count.questions
    };
  });
}

// Increments the public view counter that drives conversion reporting. Best-effort and called via
// `after()` from the public pages so it never blocks render or affects the cached calculator read.
export async function recordCalculatorView(publicId: string) {
  try {
    await prisma.calculator.update({
      where: { publicId },
      data: { viewCount: { increment: 1 } }
    });
  } catch {
    // View counting is non-critical analytics; never surface a failure to the visitor.
  }
}

export async function getDashboardStats() {
  const workspace = await getCurrentWorkspace();
  const [calculatorCount, publishedCount, leadCount, pipelineTotal] = await Promise.all([
    prisma.calculator.count({ where: { companyId: workspace.companyId, isArchived: false } }),
    prisma.calculator.count({ where: { companyId: workspace.companyId, isPublished: true, isArchived: false } }),
    prisma.quoteSubmission.count({ where: { calculator: { companyId: workspace.companyId } } }),
    prisma.quoteSubmission.aggregate({
      where: { calculator: { companyId: workspace.companyId } },
      _sum: { estimatedPrice: true }
    })
  ]);

  return {
    calculatorCount,
    publishedCount,
    leadCount,
    pipeline: Number(pipelineTotal._sum.estimatedPrice ?? 0)
  };
}

export async function getLeadListItems(limit?: number): Promise<LeadListItem[]> {
  const workspace = await getCurrentWorkspace();
  const submissions = await prisma.quoteSubmission.findMany({
    where: {
      calculator: {
        companyId: workspace.companyId
      }
    },
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
    status: normalizeLeadStatus(submission.status),
    answersSummary: summarizeAnswers(submission.answers),
    answerItems: getAnswerItems(submission.answers),
    createdAt: submission.createdAt
  }));
}

export async function getCalculatorEditorById(id: string): Promise<CalculatorEditor | null> {
  const workspace = await getCurrentWorkspace();
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

  if (!calculator || calculator.isArchived || calculator.companyId !== workspace.companyId) {
    return null;
  }

  const questions = calculator.questions.map((question) => ({
    id: question.id,
    label: question.label,
    questionType: normalizeQuestionType(question.questionType),
    options: normalizeOptions(question.options),
    isRequired: question.isRequired,
    visibilityCondition: normalizeVisibilityCondition(question.visibilityCondition),
    sortOrder: question.sortOrder
  }));
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  return {
    id: calculator.id,
    name: calculator.name,
    slug: calculator.slug,
    publicId: calculator.publicId,
    description: calculator.description ?? "",
    isPublished: calculator.isPublished,
    branding: normalizeBranding(calculator),
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
        option: option ?? "",
        configLabel: option ? `Option: ${option}` : questionMap.get(rule.questionId ?? "")?.label ?? "No question"
      };
    })
  };
}

export async function getQuoteCalculatorPreviewById(id: string): Promise<QuoteCalculator | null> {
  const calculator = await getCalculatorEditorById(id);

  if (!calculator) {
    return null;
  }

  return {
    id: calculator.id,
    name: calculator.name,
    slug: calculator.slug,
    publicId: calculator.publicId,
    description: calculator.description || "Answer a few questions and receive a working estimate.",
    isPublished: calculator.isPublished,
    branding: calculator.branding,
    questions: calculator.questions,
    rules: calculator.rules.map(({ id: ruleId, questionId, ruleType, ruleConfig, amount }) => ({
      id: ruleId,
      questionId,
      ruleType,
      ruleConfig,
      amount
    }))
  };
}

export async function getQuoteCalculatorByPublicId(publicId: string, slug: string): Promise<QuoteCalculator | null> {
  // Cache the calculator read so embedded calculators don't query Postgres on every host-page impression.
  // Primary invalidation is the per-calculator tag (`revalidateTag("calculator:<publicId>")` from the
  // mutation actions / Stripe webhook). The short `revalidate` is a safety net: even if a tag bust is
  // missed, a publish/unpublish/branding change still propagates within a few minutes.
  const loadCached = unstable_cache(
    () => loadQuoteCalculatorByPublicId(publicId, slug),
    ["quote-calculator", publicId, slug],
    { tags: [`calculator:${publicId}`], revalidate: 300 }
  );

  return loadCached();
}

async function loadQuoteCalculatorByPublicId(publicId: string, slug: string): Promise<QuoteCalculator | null> {
  const calculator = await prisma.calculator.findUnique({
    where: { publicId },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" }
      },
      pricingRules: true
    }
  });

  if (!calculator || calculator.slug !== slug || calculator.isArchived || !calculator.isPublished) {
    return null;
  }

  const questions = calculator.questions.map((question) => ({
    id: question.id,
    label: question.label,
    questionType: normalizeQuestionType(question.questionType),
    options: normalizeOptions(question.options),
    isRequired: question.isRequired,
    visibilityCondition: normalizeVisibilityCondition(question.visibilityCondition),
    sortOrder: question.sortOrder
  }));
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  return {
    id: calculator.id,
    name: calculator.name,
    slug: calculator.slug,
    publicId: calculator.publicId,
    description: calculator.description ?? "Answer a few questions and receive a working estimate.",
    isPublished: calculator.isPublished,
    branding: normalizeBranding(calculator),
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

// Monthly lead usage for the current workspace, used to surface the over-limit upgrade nudge on the
// dashboard. Leads are always stored (store + nudge); this only drives the banner.
export async function getWorkspaceLeadUsage(): Promise<LeadUsage> {
  const workspace = await getCurrentWorkspace();
  const [company, usedThisPeriod] = await Promise.all([
    prisma.company.findUnique({ where: { id: workspace.companyId }, select: { planTier: true } }),
    prisma.quoteSubmission.count({
      where: {
        calculator: { companyId: workspace.companyId },
        createdAt: { gte: getCurrentPeriodStart() }
      }
    })
  ]);

  return getLeadUsage({ planTier: company?.planTier, usedThisPeriod });
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

function normalizeBranding(calculator: {
  name: string;
  description: string | null;
  brandName: string | null;
  brandLogoUrl: string | null;
  brandColor: string | null;
  brandIntro: string | null;
  brandFooter: string | null;
}): CalculatorBranding {
  const description = calculator.description ?? "Answer a few questions and receive a working estimate.";

  return {
    displayName: calculator.brandName?.trim() || calculator.name,
    logoUrl: calculator.brandLogoUrl?.trim() || null,
    primaryColor: normalizeBrandColor(calculator.brandColor),
    introText: calculator.brandIntro?.trim() || description,
    footerText: calculator.brandFooter?.trim() || null
  };
}

function normalizeBrandColor(value: string | null) {
  if (value && /^#[0-9a-f]{6}$/i.test(value.trim())) {
    return value.trim();
  }

  return defaultBrandColor;
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
  const values = getAnswerItems(answers).map((answer) => `${answer.label}: ${answer.value}`);

  return values.length > 0 ? values.join(" | ") : "No answers captured.";
}

function getAnswerItems(answers: unknown): LeadAnswerItem[] {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return [];
  }

  return Object.values(answers as Record<string, unknown>)
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const label = (entry as Record<string, unknown>).label;
      const value = (entry as Record<string, unknown>).value;
      if (typeof label !== "string" || !label.trim()) return null;

      return {
        label,
        value: formatAnswerValue(value)
      };
    })
    .filter((value): value is LeadAnswerItem => Boolean(value));
}

function formatAnswerValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "Not answered";
  }

  return String(value);
}

function normalizeLeadStatus(status: string): LeadStatus {
  if (status === "CONTACTED" || status === "WON" || status === "LOST") {
    return status;
  }

  return "NEW";
}
