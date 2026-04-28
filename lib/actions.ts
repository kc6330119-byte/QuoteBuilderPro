"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuoteCalculatorBySlug, type LeadStatus, type QuoteQuestion } from "@/lib/calculator-data";
import { calculateQuote, getVisibleQuestions, type QuoteAnswers } from "@/lib/quote-engine";

const leadStatuses: LeadStatus[] = ["NEW", "CONTACTED", "WON", "LOST"];

type ParsedQuestion = {
  label: string;
  questionType: QuoteQuestion["questionType"];
  options: string[];
  isRequired: boolean;
  pricingAmount: string;
  sortOrder: number;
};

export async function createCalculatorAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const name = requiredString(formData, "name", "Untitled calculator");
  const slug = await createUniqueSlug(requiredString(formData, "slug", name));
  const description = optionalString(formData, "description");
  const businessType = optionalString(formData, "businessType");
  const basePrice = currencyString(formData.get("basePrice"));
  const isPublished = formData.get("isPublished") === "on";
  const questions = parseQuestions(formData);

  const calculator = await prisma.$transaction(async (tx) => {
    const createdCalculator = await tx.calculator.create({
      data: {
        userId: workspace.id,
        companyId: workspace.companyId,
        name,
        slug,
        description,
        businessType,
        isPublished
      }
    });

    await tx.pricingRule.create({
      data: {
        calculatorId: createdCalculator.id,
        ruleType: "base_price",
        amount: basePrice,
        sortOrder: 0
      }
    });

    for (const question of questions) {
      const createdQuestion = await tx.question.create({
        data: {
          calculatorId: createdCalculator.id,
          label: question.label,
          questionType: question.questionType,
          options: question.questionType === "SELECT" ? question.options : undefined,
          isRequired: question.isRequired,
          sortOrder: question.sortOrder
        }
      });

      await tx.pricingRule.create({
        data: {
          calculatorId: createdCalculator.id,
          questionId: createdQuestion.id,
          ruleType: getDefaultRuleType(question.questionType),
          ruleConfig:
            question.questionType === "SELECT" && question.options[0]
              ? { questionId: createdQuestion.id, option: question.options[0] }
              : { questionId: createdQuestion.id },
          amount: question.pricingAmount,
          sortOrder: question.sortOrder
        }
      });
    }

    return createdCalculator;
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function addQuestionAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const label = requiredString(formData, "label", "");
  const questionType = normalizeQuestionType(requiredString(formData, "questionType", "TEXT"));
  const options = String(formData.get("options") ?? "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
  const isRequired = formData.get("isRequired") === "on";
  const visibilityCondition = buildVisibilityCondition(
    optionalString(formData, "visibilityQuestionId"),
    optionalString(formData, "visibilityValue")
  );

  if (!calculatorId || !label) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const calculator = await getWorkspaceCalculator(calculatorId, workspace.companyId);
  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  const sortOrder = await prisma.question.count({ where: { calculatorId: calculator.id } });

  await prisma.question.create({
    data: {
      calculatorId: calculator.id,
      label,
      questionType,
      options: questionType === "SELECT" ? options : Prisma.DbNull,
      visibilityCondition: visibilityCondition ?? Prisma.DbNull,
      isRequired,
      sortOrder
    }
  });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function updateQuestionAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const questionId = requiredString(formData, "questionId", "");
  const label = requiredString(formData, "label", "");
  const questionType = normalizeQuestionType(requiredString(formData, "questionType", "TEXT"));
  const options = parseOptionList(formData.get("options"));
  const isRequired = formData.get("isRequired") === "on";
  const sortOrder = Math.max(0, integerValue(formData.get("sortOrder")) - 1);
  const visibilityCondition = buildVisibilityCondition(
    optionalString(formData, "visibilityQuestionId"),
    optionalString(formData, "visibilityValue"),
    questionId
  );

  if (!calculatorId || !questionId || !label) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      calculatorId,
      calculator: {
        companyId: workspace.companyId,
        isArchived: false
      }
    },
    select: { id: true }
  });

  if (!question) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.question.update({
    where: { id: question.id },
    data: {
      label,
      questionType,
      options: questionType === "SELECT" ? options : Prisma.DbNull,
      visibilityCondition: visibilityCondition ?? Prisma.DbNull,
      isRequired,
      sortOrder
    }
  });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function deleteQuestionAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const questionId = requiredString(formData, "questionId", "");

  if (!calculatorId || !questionId) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      calculatorId,
      calculator: {
        companyId: workspace.companyId,
        isArchived: false
      }
    },
    select: { id: true }
  });

  if (!question) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.$transaction([
    prisma.question.updateMany({
      where: {
        calculatorId,
        visibilityCondition: {
          path: ["questionId"],
          equals: question.id
        }
      },
      data: {
        visibilityCondition: Prisma.DbNull
      }
    }),
    prisma.pricingRule.deleteMany({ where: { calculatorId, questionId: question.id } }),
    prisma.question.delete({ where: { id: question.id } })
  ]);

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function addPricingRuleAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const ruleType = normalizePricingRuleType(requiredString(formData, "ruleType", "base_price"));
  const questionId = optionalString(formData, "questionId");
  const option = optionalString(formData, "option");
  const amount = currencyString(formData.get("amount"));

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  const calculator = await getWorkspaceCalculator(calculatorId, workspace.companyId);
  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  await prisma.pricingRule.create({
    data: {
      calculatorId: calculator.id,
      questionId: ruleType === "base_price" ? null : questionId,
      ruleType,
      ruleConfig: ruleType === "base_price" ? Prisma.DbNull : buildRuleConfig(questionId, option) ?? Prisma.DbNull,
      amount,
      sortOrder: await prisma.pricingRule.count({ where: { calculatorId: calculator.id } })
    }
  });

  revalidateCalculator(calculator.id);
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function updatePricingRuleAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const ruleId = requiredString(formData, "ruleId", "");
  const ruleType = normalizePricingRuleType(requiredString(formData, "ruleType", "base_price"));
  const questionId = optionalString(formData, "questionId");
  const option = optionalString(formData, "option");
  const amount = currencyString(formData.get("amount"));
  const sortOrder = Math.max(0, integerValue(formData.get("sortOrder")) - 1);

  if (!calculatorId || !ruleId) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const rule = await prisma.pricingRule.findFirst({
    where: {
      id: ruleId,
      calculatorId,
      calculator: {
        companyId: workspace.companyId,
        isArchived: false
      }
    },
    select: { id: true }
  });

  if (!rule) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.pricingRule.update({
    where: { id: rule.id },
    data: {
      ruleType,
      questionId: ruleType === "base_price" ? null : questionId,
      ruleConfig: ruleType === "base_price" ? Prisma.DbNull : buildRuleConfig(questionId, option) ?? Prisma.DbNull,
      amount,
      sortOrder
    }
  });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function deletePricingRuleAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const ruleId = requiredString(formData, "ruleId", "");

  if (!calculatorId || !ruleId) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const rule = await prisma.pricingRule.findFirst({
    where: {
      id: ruleId,
      calculatorId,
      calculator: {
        companyId: workspace.companyId,
        isArchived: false
      }
    },
    select: { id: true }
  });

  if (!rule) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.pricingRule.delete({ where: { id: rule.id } });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function updateCalculatorPublishStatusAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const isPublished = formData.get("isPublished") === "true";

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  const calculator = await prisma.calculator.findFirst({
    where: {
      id: calculatorId,
      companyId: workspace.companyId,
      isArchived: false
    },
    select: {
      id: true,
      slug: true
    }
  });

  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  await prisma.calculator.update({
    where: { id: calculator.id },
    data: { isPublished }
  });

  revalidateCalculator(calculator.id);
  revalidatePath(`/quote/${calculator.slug}`);
  revalidatePath(`/embed/${calculator.slug}`);
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function createQuoteSubmissionAction(formData: FormData) {
  const calculatorId = requiredString(formData, "calculatorId", "");
  const calculatorSlug = requiredString(formData, "calculatorSlug", "");
  const returnTo = normalizeQuoteReturnPath(optionalString(formData, "returnTo"), calculatorSlug);
  const calculator = await getQuoteCalculatorBySlug(calculatorSlug);

  if (!calculator || calculator.source !== "database" || calculator.id !== calculatorId) {
    redirect(returnTo);
  }

  const acceptedLegalAcknowledgement = formData.get("acceptedLegalAcknowledgement") === "on";
  if (!acceptedLegalAcknowledgement) {
    redirect(`${returnTo}?legal=required`);
  }

  const rawAnswers: QuoteAnswers = Object.fromEntries(
    calculator.questions.map((question) => {
      const rawValue = formData.get(`answer_${question.id}`);
      return [question.id, question.questionType === "BOOLEAN" ? rawValue === "true" : String(rawValue ?? "")];
    })
  );
  const answers = Object.fromEntries(
    getVisibleQuestions(calculator.questions, rawAnswers).map((question) => {
      return [
        question.id,
        {
          label: question.label,
          value: rawAnswers[question.id]
        }
      ];
    })
  );
  const estimatedPrice = calculateQuote(calculator.questions, calculator.rules, rawAnswers);

  await prisma.quoteSubmission.create({
    data: {
      calculatorId,
      customerName: requiredString(formData, "customerName", "Unknown customer"),
      customerEmail: requiredString(formData, "customerEmail", "unknown@example.com"),
      customerPhone: optionalString(formData, "customerPhone"),
      customerNotes: optionalString(formData, "customerNotes"),
      answers,
      estimatedPrice: estimatedPrice.toFixed(2),
      acceptedEstimateDisclaimer: true,
      acceptedLegalTerms: true,
      acceptedAt: new Date()
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/calculators");
  redirect(`${returnTo}?submitted=1`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const leadId = requiredString(formData, "leadId", "");
  const status = normalizeLeadStatusInput(formData.get("status"));

  if (!leadId) {
    redirect("/dashboard/leads");
  }

  const lead = await prisma.quoteSubmission.findFirst({
    where: {
      id: leadId,
      calculator: {
        companyId: workspace.companyId
      }
    },
    select: { id: true }
  });

  if (!lead) {
    redirect("/dashboard/leads");
  }

  await prisma.quoteSubmission.update({
    where: { id: lead.id },
    data: { status }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads");
}

export async function deleteLeadAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const leadId = requiredString(formData, "leadId", "");

  if (!leadId) {
    redirect("/dashboard/leads");
  }

  const lead = await prisma.quoteSubmission.findFirst({
    where: {
      id: leadId,
      calculator: {
        companyId: workspace.companyId
      }
    },
    select: { id: true }
  });

  if (!lead) {
    redirect("/dashboard/leads");
  }

  await prisma.quoteSubmission.delete({
    where: { id: lead.id }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads");
}

export async function archiveCalculatorAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  const calculator = await prisma.calculator.findFirst({
    where: {
      id: calculatorId,
      companyId: workspace.companyId
    },
    select: {
      id: true,
      slug: true
    }
  });

  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  await prisma.calculator.update({
    where: { id: calculator.id },
    data: {
      isArchived: true,
      isPublished: false
    }
  });

  revalidateCalculator(calculator.id);
  revalidatePath(`/quote/${calculator.slug}`);
  revalidatePath(`/embed/${calculator.slug}`);
  redirect("/dashboard/calculators");
}

export async function deleteCalculatorAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  const calculator = await prisma.calculator.findFirst({
    where: {
      id: calculatorId,
      companyId: workspace.companyId
    },
    select: {
      id: true,
      slug: true
    }
  });

  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  await prisma.$transaction([
    prisma.quoteSubmission.deleteMany({ where: { calculatorId: calculator.id } }),
    prisma.pricingRule.deleteMany({ where: { calculatorId: calculator.id } }),
    prisma.question.deleteMany({ where: { calculatorId: calculator.id } }),
    prisma.calculator.delete({ where: { id: calculator.id } })
  ]);

  revalidateCalculator(calculator.id);
  revalidatePath("/dashboard/leads");
  revalidatePath(`/quote/${calculator.slug}`);
  revalidatePath(`/embed/${calculator.slug}`);
  redirect("/dashboard/calculators");
}

function parseQuestions(formData: FormData): ParsedQuestion[] {
  const ids = formData.getAll("questionIds").map(String);

  return ids
    .map((formId, index) => {
      const label = requiredString(formData, `questionLabel_${formId}`, "");

      return {
        label,
        questionType: normalizeQuestionType(String(formData.get(`questionType_${formId}`) ?? "TEXT")),
        options: String(formData.get(`questionOptions_${formId}`) ?? "")
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
        isRequired: formData.get(`questionRequired_${formId}`) === "on",
        pricingAmount: currencyString(formData.get(`questionPrice_${formId}`)),
        sortOrder: index
      };
    })
    .filter((question) => question.label.length > 0);
}

async function createUniqueSlug(value: string) {
  const baseSlug = slugify(value);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.calculator.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function getWorkspaceCalculator(calculatorId: string, companyId: string) {
  return prisma.calculator.findFirst({
    where: {
      id: calculatorId,
      companyId,
      isArchived: false
    },
    select: {
      id: true,
      slug: true
    }
  });
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "calculator"
  );
}

function requiredString(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || fallback;
}

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function parseOptionList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
}

function currencyString(value: FormDataEntryValue | null) {
  const numberValue = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : "0.00";
}

function integerValue(value: FormDataEntryValue | null) {
  const numberValue = Number(String(value ?? "0").replace(/[^0-9-]/g, ""));
  return Number.isFinite(numberValue) ? Math.max(0, Math.round(numberValue)) : 0;
}

function normalizeQuestionType(questionType: string): QuoteQuestion["questionType"] {
  if (questionType === "NUMBER" || questionType === "SELECT" || questionType === "BOOLEAN" || questionType === "TEXT") {
    return questionType;
  }

  return "TEXT";
}

function normalizePricingRuleType(ruleType: string) {
  if (
    ruleType === "base_price" ||
    ruleType === "quantity_multiplier" ||
    ruleType === "option_price" ||
    ruleType === "checkbox_addon"
  ) {
    return ruleType;
  }

  return "base_price";
}

function buildVisibilityCondition(questionId: string | null, rawValue: string | null, currentQuestionId?: string) {
  if (!questionId || questionId === currentQuestionId) {
    return null;
  }

  const value = rawValue?.trim() ?? "";
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === "true" || normalizedValue === "checked" || normalizedValue === "yes" || normalizedValue === "on") {
    return {
      questionId,
      operator: "checked",
      value: true
    };
  }

  return {
    questionId,
    operator: "equals",
    value
  };
}

function getDefaultRuleType(questionType: QuoteQuestion["questionType"]) {
  if (questionType === "NUMBER") return "quantity_multiplier";
  if (questionType === "BOOLEAN") return "checkbox_addon";
  if (questionType === "SELECT") return "option_price";

  return "quantity_multiplier";
}

function buildRuleConfig(questionId: string | null, option: string | null) {
  const config: Record<string, string> = {};

  if (questionId) config.questionId = questionId;
  if (option) config.option = option;

  return Object.keys(config).length > 0 ? config : undefined;
}

function normalizeLeadStatusInput(value: FormDataEntryValue | null): LeadStatus {
  const status = String(value ?? "");

  return leadStatuses.includes(status as LeadStatus) ? (status as LeadStatus) : "NEW";
}

function normalizeQuoteReturnPath(value: string | null, slug: string) {
  if (value === `/embed/${slug}` || value === `/quote/${slug}`) {
    return value;
  }

  return `/quote/${slug}`;
}

function revalidateCalculator(calculatorId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  revalidatePath(`/preview/${calculatorId}`);
  revalidatePath("/quote/[slug]", "page");
}
