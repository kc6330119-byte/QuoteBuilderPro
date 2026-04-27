import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/auth";
import { calculators as mockCalculators, leads as mockLeads } from "@/lib/mock-data";

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
  createdAt: Date | string;
};

export type QuoteQuestion = {
  id: string;
  label: string;
  questionType: "NUMBER" | "SELECT" | "BOOLEAN" | "TEXT";
  options: string[];
  isRequired: boolean;
  sortOrder: number;
  pricingAmount: number;
};

export type QuoteCalculator = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublished: boolean;
  source: "database" | "mock";
  basePrice: number;
  questions: QuoteQuestion[];
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
    createdAt: submission.createdAt
  }));
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
    const baseRule = calculator.pricingRules.find((rule) => rule.ruleType === "BASE_PRICE");

    return {
      id: calculator.id,
      name: calculator.name,
      slug: calculator.slug,
      description: calculator.description ?? "Answer a few questions and receive a working estimate.",
      isPublished: calculator.isPublished,
      source: "database",
      basePrice: Number(baseRule?.amount ?? 0),
      questions: calculator.questions.map((question) => {
        const pricingRule = question.pricingRules.find((rule) => rule.ruleType === "QUESTION_AMOUNT");

        return {
          id: question.id,
          label: question.label,
          questionType: normalizeQuestionType(question.questionType),
          options: normalizeOptions(question.options),
          isRequired: question.isRequired,
          sortOrder: question.sortOrder,
          pricingAmount: Number(pricingRule?.amount ?? 0)
        };
      })
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
    basePrice: mock.basePrice / 100,
    questions: mock.fields.map((field, index) => ({
      id: field.id,
      label: field.label,
      questionType:
        field.type === "NUMBER" ? "NUMBER" : field.type === "BOOLEAN" ? "BOOLEAN" : field.type === "SELECT" ? "SELECT" : "TEXT",
      options: field.options?.map((option) => option.label) ?? [],
      isRequired: field.required ?? true,
      sortOrder: index,
      pricingAmount:
        field.type === "NUMBER"
          ? (field.pricePerUnit ?? 0) / 100
          : field.type === "BOOLEAN"
            ? (field.priceDelta ?? 0) / 100
            : 0
    }))
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

function normalizeQuestionType(questionType: string): QuoteQuestion["questionType"] {
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
