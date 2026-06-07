"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUniquePublicCalculatorId } from "@/lib/public-calculator-id";
import { getCalculatorTemplateById, type TemplatePricingRule, type TemplateQuestion } from "@/lib/templates";
import { slugify } from "@/lib/utils";

export async function useTemplateAction(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const template = getCalculatorTemplateById(templateId);

  if (!template) {
    redirect("/dashboard/templates");
  }

  const workspace = await getCurrentWorkspace();
  const slug = slugify(template.name, "calculator-template");
  const publicId = await createUniquePublicCalculatorId();

  let calculatorId: string;

  try {
    const calculator = await prisma.$transaction(async (tx) => {
      const createdCalculator = await tx.calculator.create({
        data: {
          userId: workspace.id,
          companyId: workspace.companyId,
          name: template.name,
          slug,
          publicId,
          businessType: template.businessType,
          description: `${template.description} Customize questions and pricing rules before publishing.`,
          isPublished: false
        }
      });

      const questionIdByLabel = new Map<string, string>();

      for (let index = 0; index < template.questions.length; index += 1) {
        const question = template.questions[index];
        const createdQuestion = await tx.question.create({
          data: {
            calculatorId: createdCalculator.id,
            label: question.label,
            questionType: toPrismaQuestionType(question),
            options: question.type === "select" ? question.options : Prisma.DbNull,
            isRequired: question.required,
            sortOrder: index
          }
        });

        questionIdByLabel.set(question.label, createdQuestion.id);
      }

      for (let index = 0; index < template.pricingRules.length; index += 1) {
        const rule = template.pricingRules[index];
        const questionId = getTemplateRuleQuestionId(rule, questionIdByLabel);

        await tx.pricingRule.create({
          data: {
            calculatorId: createdCalculator.id,
            questionId,
            ruleType: rule.ruleType,
            ruleConfig: buildTemplateRuleConfig(rule),
            amount: rule.amount.toFixed(2),
            sortOrder: index
          }
        });
      }

      return createdCalculator;
    });

    calculatorId = calculator.id;
  } catch (error) {
    console.error("Template calculator creation failed", error);
    redirect("/dashboard/templates?error=template-create-failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  redirect(`/dashboard/calculators/${calculatorId}`);
}

function toPrismaQuestionType(question: TemplateQuestion) {
  if (question.type === "number") return "NUMBER";
  if (question.type === "select") return "SELECT";
  if (question.type === "checkbox") return "BOOLEAN";

  return "TEXT";
}

function getTemplateRuleQuestionId(rule: TemplatePricingRule, questionIdByLabel: Map<string, string>) {
  if (rule.ruleType === "base_price") {
    return null;
  }

  if (!rule.questionLabel) {
    throw new Error(`Template pricing rule "${rule.ruleType}" is missing a questionLabel.`);
  }

  const questionId = questionIdByLabel.get(rule.questionLabel);
  if (!questionId) {
    throw new Error(`Template pricing rule references unknown question "${rule.questionLabel}".`);
  }

  return questionId;
}

function buildTemplateRuleConfig(rule: TemplatePricingRule) {
  if (rule.ruleType !== "option_price") {
    return {};
  }

  return {
    matchValue: rule.matchValue,
    option: String(rule.matchValue ?? "")
  };
}

