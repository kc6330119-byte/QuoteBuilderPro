"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateMockUser } from "@/lib/calculator-data";
import { prisma } from "@/lib/prisma";
import { getCalculatorTemplateById } from "@/lib/templates";

export async function useTemplateAction(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const template = getCalculatorTemplateById(templateId);

  if (!template) {
    redirect("/dashboard/templates");
  }

  const user = await getOrCreateMockUser();
  const slug = await createUniqueSlug(template.name);

  const calculator = await prisma.$transaction(async (tx) => {
    const createdCalculator = await tx.calculator.create({
      data: {
        userId: user.id,
        name: template.name,
        slug,
        businessType: template.businessType,
        description: `${template.description} Customize questions and pricing rules before publishing.`,
        isPublished: false
      }
    });

    await tx.pricingRule.create({
      data: {
        calculatorId: createdCalculator.id,
        ruleType: "base_price",
        amount: "0.00",
        sortOrder: 0
      }
    });

    return createdCalculator;
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  redirect(`/dashboard/calculators/${calculator.id}`);
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
      .replace(/^-+|-+$/g, "") || "calculator-template"
  );
}
