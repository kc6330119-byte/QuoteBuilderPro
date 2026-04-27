"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateMockUser, getQuoteCalculatorBySlug, type QuoteQuestion } from "@/lib/calculator-data";

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
        ruleType: "BASE_PRICE",
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
          ruleType: "QUESTION_AMOUNT",
          amount: question.pricingAmount,
          sortOrder: question.sortOrder
        }
      });
    }

    return createdCalculator;
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  redirect(`/quote/${calculator.slug}`);
}

export async function createQuoteSubmissionAction(formData: FormData) {
  const calculatorId = requiredString(formData, "calculatorId", "");
  const calculatorSlug = requiredString(formData, "calculatorSlug", "");
  const calculator = await getQuoteCalculatorBySlug(calculatorSlug);

  if (!calculator || calculator.source !== "database" || calculator.id !== calculatorId) {
    redirect(`/quote/${calculatorSlug}`);
  }

  const answers = Object.fromEntries(
    calculator.questions.map((question) => {
      const rawValue = formData.get(`answer_${question.id}`);
      return [
        question.id,
        {
          label: question.label,
          value: question.questionType === "BOOLEAN" ? rawValue === "true" : String(rawValue ?? "")
        }
      ];
    })
  );
  const estimatedPrice = calculateEstimatedPrice(calculator.questions, answers, calculator.basePrice);

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

function calculateEstimatedPrice(
  questions: QuoteQuestion[],
  answers: Record<string, { label: string; value: string | boolean }>,
  basePrice: number
) {
  return questions.reduce((sum, question) => {
    const value = answers[question.id]?.value;

    if (question.questionType === "NUMBER") {
      return sum + Number(value || 0) * question.pricingAmount;
    }

    if (question.questionType === "BOOLEAN") {
      return value === true ? sum + question.pricingAmount : sum;
    }

    if (question.questionType === "SELECT") {
      return value ? sum + question.pricingAmount : sum;
    }

    return sum;
  }, basePrice);
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
