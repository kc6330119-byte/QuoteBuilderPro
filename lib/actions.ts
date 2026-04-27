"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateMockUser, getQuoteCalculatorBySlug, type QuoteQuestion } from "@/lib/calculator-data";
import { calculateQuote, type QuoteAnswers } from "@/lib/quote-engine";

type ParsedQuestion = {
  label: string;
  questionType: QuoteQuestion["questionType"];
  options: string[];
  isRequired: boolean;
  pricingAmount: string;
  sortOrder: number;
};

export async function createCalculatorAction(formData: FormData) {
  const user = await getOrCreateMockUser();
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
        userId: user.id,
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
  const calculatorId = requiredString(formData, "calculatorId", "");
  const label = requiredString(formData, "label", "");
  const questionType = normalizeQuestionType(requiredString(formData, "questionType", "TEXT"));
  const options = String(formData.get("options") ?? "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
  const isRequired = formData.get("isRequired") === "on";

  if (!calculatorId || !label) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const sortOrder = await prisma.question.count({ where: { calculatorId } });

  await prisma.question.create({
    data: {
      calculatorId,
      label,
      questionType,
      options: questionType === "SELECT" ? options : undefined,
      isRequired,
      sortOrder
    }
  });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function addPricingRuleAction(formData: FormData) {
  const calculatorId = requiredString(formData, "calculatorId", "");
  const ruleType = requiredString(formData, "ruleType", "base_price");
  const questionId = optionalString(formData, "questionId");
  const option = optionalString(formData, "option");
  const amount = currencyString(formData.get("amount"));

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  await prisma.pricingRule.create({
    data: {
      calculatorId,
      questionId: ruleType === "base_price" ? null : questionId,
      ruleType,
      ruleConfig: buildRuleConfig(questionId, option),
      amount,
      sortOrder: await prisma.pricingRule.count({ where: { calculatorId } })
    }
  });

  revalidateCalculator(calculatorId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function createQuoteSubmissionAction(formData: FormData) {
  const calculatorId = requiredString(formData, "calculatorId", "");
  const calculatorSlug = requiredString(formData, "calculatorSlug", "");
  const calculator = await getQuoteCalculatorBySlug(calculatorSlug);

  if (!calculator || calculator.source !== "database" || calculator.id !== calculatorId) {
    redirect(`/quote/${calculatorSlug}`);
  }

  const rawAnswers: QuoteAnswers = Object.fromEntries(
    calculator.questions.map((question) => {
      const rawValue = formData.get(`answer_${question.id}`);
      return [question.id, question.questionType === "BOOLEAN" ? rawValue === "true" : String(rawValue ?? "")];
    })
  );
  const answers = Object.fromEntries(
    calculator.questions.map((question) => {
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
      estimatedPrice: estimatedPrice.toFixed(2)
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/calculators");
  redirect(`/quote/${calculatorSlug}?submitted=1`);
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

function currencyString(value: FormDataEntryValue | null) {
  const numberValue = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : "0.00";
}

function normalizeQuestionType(questionType: string): QuoteQuestion["questionType"] {
  if (questionType === "NUMBER" || questionType === "SELECT" || questionType === "BOOLEAN" || questionType === "TEXT") {
    return questionType;
  }

  return "TEXT";
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

function revalidateCalculator(calculatorId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  revalidatePath("/quote/[slug]", "page");
}
