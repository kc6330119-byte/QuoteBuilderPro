"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCalculatorEditorById,
  getQuoteCalculatorByPublicId,
  type LeadStatus,
  type QuoteQuestion,
  type WorkspaceSaveInput,
  type WorkspaceSaveQuestion,
  type WorkspaceSaveResult
} from "@/lib/calculator-data";
import { checkCanCreateCalculator, checkCanPublish } from "@/lib/entitlements";
import { legalLastUpdated } from "@/lib/legal-content";
import { buildPublicEmbedPath, buildPublicQuotePath } from "@/lib/public-calculator-paths";
import { createUniquePublicCalculatorId } from "@/lib/public-calculator-id";
import { calculateQuote, getVisibleQuestions, type QuoteAnswers } from "@/lib/quote-engine";
import { checkRateLimit, hashIdentifier } from "@/lib/rate-limit";
import { getAppUrl } from "@/lib/stripe";
import { slugify } from "@/lib/utils";

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
  const slug = slugify(requiredString(formData, "slug", name), "calculator");
  const publicId = await createUniquePublicCalculatorId();
  const description = optionalString(formData, "description");
  const businessType = optionalString(formData, "businessType");
  const basePrice = currencyString(formData.get("basePrice"));
  const questions = parseQuestions(formData);

  const [company, totalCalculatorCount, publishedCalculatorCount] = await Promise.all([
    prisma.company.findUnique({
      where: { id: workspace.companyId },
      select: { planTier: true, subscriptionStatus: true }
    }),
    prisma.calculator.count({ where: { companyId: workspace.companyId, isArchived: false } }),
    prisma.calculator.count({ where: { companyId: workspace.companyId, isArchived: false, isPublished: true } })
  ]);

  if (!checkCanCreateCalculator({ planTier: company?.planTier, totalCalculatorCount }).allowed) {
    redirect("/dashboard/billing?checkout=calculator-create-limit");
  }

  // Honor the publish checkbox only when the plan allows publishing; otherwise the calculator is created as a draft.
  const isPublished =
    formData.get("isPublished") === "on" &&
    checkCanPublish({
      planTier: company?.planTier,
      subscriptionStatus: company?.subscriptionStatus,
      otherPublishedCount: publishedCalculatorCount
    }).allowed;

  const calculator = await prisma.$transaction(async (tx) => {
    const createdCalculator = await tx.calculator.create({
      data: {
        userId: workspace.id,
        companyId: workspace.companyId,
        name,
        slug,
        publicId,
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

  revalidateCalculator(calculator.id, calculator.publicId);
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
    select: { id: true, calculator: { select: { publicId: true } } }
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

  revalidateCalculator(calculatorId, question.calculator.publicId);
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
    select: { id: true, calculator: { select: { publicId: true } } }
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

  revalidateCalculator(calculatorId, question.calculator.publicId);
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

  revalidateCalculator(calculator.id, calculator.publicId);
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
    select: { id: true, calculator: { select: { publicId: true } } }
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

  revalidateCalculator(calculatorId, rule.calculator.publicId);
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
    select: { id: true, calculator: { select: { publicId: true } } }
  });

  if (!rule) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.pricingRule.delete({ where: { id: rule.id } });

  revalidateCalculator(calculatorId, rule.calculator.publicId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

// ---------------------------------------------------------------------------
// Inline-pricing editor actions. Pricing now lives on each question card, so these reconcile the
// underlying PricingRule rows (delete + recreate per question) from the inline form inputs. The public/
// preview engine still reads those rows, so its behavior is unchanged.
// ---------------------------------------------------------------------------

export async function updateCalculatorBasePriceAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const basePrice = currencyString(formData.get("basePrice"));

  if (!calculatorId) {
    redirect("/dashboard/calculators");
  }

  const calculator = await getWorkspaceCalculator(calculatorId, workspace.companyId);
  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  // Exactly one base-price rule (questionId null) per calculator.
  await prisma.$transaction([
    prisma.pricingRule.deleteMany({ where: { calculatorId: calculator.id, questionId: null } }),
    prisma.pricingRule.create({
      data: { calculatorId: calculator.id, ruleType: "base_price", amount: basePrice, sortOrder: 0 }
    })
  ]);

  revalidateCalculator(calculator.id, calculator.publicId);
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function addCalculatorQuestionAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const label = requiredString(formData, "label", "");
  const questionType = normalizeQuestionType(requiredString(formData, "questionType", "SELECT"));
  const isRequired = formData.get("isRequired") === "on";
  const visibilityCondition = buildVisibilityCondition(
    optionalString(formData, "visibilityQuestionId"),
    optionalString(formData, "visibilityValue")
  );
  const optionLabels = parseOptionLabels(formData);

  if (!calculatorId || !label) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  const calculator = await getWorkspaceCalculator(calculatorId, workspace.companyId);
  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  const sortOrder = await prisma.question.count({ where: { calculatorId: calculator.id } });

  await prisma.$transaction(async (tx) => {
    const question = await tx.question.create({
      data: {
        calculatorId: calculator.id,
        label,
        questionType,
        options: questionType === "SELECT" ? optionLabels : Prisma.DbNull,
        visibilityCondition: visibilityCondition ?? Prisma.DbNull,
        isRequired,
        sortOrder
      }
    });

    const pricingRules = buildQuestionPricingRules(calculator.id, question.id, questionType, formData);
    if (pricingRules.length > 0) {
      await tx.pricingRule.createMany({ data: pricingRules });
    }
  });

  revalidateCalculator(calculator.id, calculator.publicId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

export async function saveCalculatorQuestionAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");
  const questionId = requiredString(formData, "questionId", "");
  const label = requiredString(formData, "label", "");
  const questionType = normalizeQuestionType(requiredString(formData, "questionType", "SELECT"));
  const isRequired = formData.get("isRequired") === "on";
  const visibilityCondition = buildVisibilityCondition(
    optionalString(formData, "visibilityQuestionId"),
    optionalString(formData, "visibilityValue"),
    questionId
  );
  const optionLabels = parseOptionLabels(formData);

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
    select: { id: true, calculator: { select: { publicId: true } } }
  });

  if (!question) {
    redirect(`/dashboard/calculators/${calculatorId}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: question.id },
      data: {
        label,
        questionType,
        options: questionType === "SELECT" ? optionLabels : Prisma.DbNull,
        visibilityCondition: visibilityCondition ?? Prisma.DbNull,
        isRequired
      }
    });

    // Rebuild this question's pricing rows from the inline inputs (base-price row, questionId null, untouched).
    await tx.pricingRule.deleteMany({ where: { calculatorId, questionId: question.id } });
    const pricingRules = buildQuestionPricingRules(calculatorId, question.id, questionType, formData);
    if (pricingRules.length > 0) {
      await tx.pricingRule.createMany({ data: pricingRules });
    }
  });

  revalidateCalculator(calculatorId, question.calculator.publicId);
  redirect(`/dashboard/calculators/${calculatorId}`);
}

// Save-all for the live editor workspace: reconciles base price + the entire question set (create new,
// update existing, delete removed, set order, rebuild each question's pricing rows) in one transaction,
// resolving client ids -> real ids so visibility conditions can reference brand-new questions. Returns the
// fresh editor model so the client can resync (real ids, normalized pricing). Public rendering is unchanged.
export async function saveCalculatorWorkspaceAction(input: WorkspaceSaveInput): Promise<WorkspaceSaveResult> {
  const workspace = await getCurrentWorkspace();
  const calculator = await getWorkspaceCalculator(input.calculatorId, workspace.companyId);

  if (!calculator) {
    return { ok: false };
  }

  const idByClientId = new Map<string, string>();

  await prisma.$transaction(async (tx) => {
    // Remove explicitly-deleted questions (rules first for the FK), scoped to this calculator.
    if (input.deletedIds.length > 0) {
      await tx.pricingRule.deleteMany({ where: { calculatorId: calculator.id, questionId: { in: input.deletedIds } } });
      await tx.question.deleteMany({ where: { calculatorId: calculator.id, id: { in: input.deletedIds } } });
    }

    // Ensure every question exists and map clientId -> real id (so visibility can reference new questions).
    for (const question of input.questions) {
      if (question.savedId) {
        idByClientId.set(question.clientId, question.savedId);
      } else {
        const created = await tx.question.create({
          data: {
            calculatorId: calculator.id,
            label: question.label || "Untitled question",
            questionType: question.questionType,
            options: question.questionType === "SELECT" ? optionLabelsFrom(question) : Prisma.DbNull,
            isRequired: question.isRequired,
            sortOrder: 0,
            visibilityCondition: Prisma.DbNull
          }
        });
        idByClientId.set(question.clientId, created.id);
      }
    }

    // Write final fields + order + translated visibility, and rebuild pricing for each question.
    for (let index = 0; index < input.questions.length; index += 1) {
      const question = input.questions[index];
      const questionId = idByClientId.get(question.clientId);
      if (!questionId) continue;

      const parentId = question.visibility ? idByClientId.get(question.visibility.questionClientId) ?? null : null;
      const visibilityCondition = parentId ? buildVisibilityCondition(parentId, question.visibility?.value ?? null, questionId) : null;

      await tx.question.update({
        where: { id: questionId },
        data: {
          label: question.label || "Untitled question",
          questionType: question.questionType,
          options: question.questionType === "SELECT" ? optionLabelsFrom(question) : Prisma.DbNull,
          isRequired: question.isRequired,
          sortOrder: index,
          visibilityCondition: visibilityCondition ?? Prisma.DbNull
        }
      });

      await tx.pricingRule.deleteMany({ where: { calculatorId: calculator.id, questionId } });
      const rules = buildPricingRulesFromQuestion(calculator.id, questionId, question);
      if (rules.length > 0) {
        await tx.pricingRule.createMany({ data: rules });
      }
    }

    // Exactly one base-price rule (questionId null).
    await tx.pricingRule.deleteMany({ where: { calculatorId: calculator.id, questionId: null } });
    await tx.pricingRule.create({
      data: { calculatorId: calculator.id, ruleType: "base_price", amount: input.basePrice.toFixed(2), sortOrder: 0 }
    });
  });

  revalidateCalculator(calculator.id, calculator.publicId);

  const fresh = await getCalculatorEditorById(calculator.id);
  return { ok: true, basePrice: fresh?.basePrice ?? 0, questions: fresh?.questions ?? [] };
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
      publicId: true,
      slug: true,
      isPublished: true,
      company: {
        select: {
          planTier: true,
          subscriptionStatus: true,
          calculators: {
            where: {
              isPublished: true,
              isArchived: false
            },
            select: { id: true }
          }
        }
      }
    }
  });

  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  if (isPublished) {
    const company = calculator.company;
    const otherPublishedCount = company?.calculators.filter((item) => item.id !== calculator.id).length ?? 0;
    const gate = checkCanPublish({
      planTier: company?.planTier,
      subscriptionStatus: company?.subscriptionStatus,
      otherPublishedCount
    });

    if (!gate.allowed) {
      redirect(`/dashboard/billing?checkout=${gate.reason}`);
    }
  }

  await prisma.calculator.update({
    where: { id: calculator.id },
    data: { isPublished }
  });

  revalidateCalculator(calculator.id, calculator.publicId);
  revalidatePath(buildPublicQuotePath(calculator));
  revalidatePath(buildPublicEmbedPath(calculator));
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function updateCalculatorBrandingAction(formData: FormData) {
  const workspace = await getCurrentWorkspace();
  const calculatorId = requiredString(formData, "calculatorId", "");

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
      publicId: true,
      slug: true
    }
  });

  if (!calculator) {
    redirect("/dashboard/calculators");
  }

  await prisma.calculator.update({
    where: { id: calculator.id },
    data: {
      brandName: optionalString(formData, "brandName"),
      brandLogoUrl: optionalUrl(formData, "brandLogoUrl"),
      brandColor: optionalHexColor(formData, "brandColor"),
      brandIntro: optionalString(formData, "brandIntro"),
      brandFooter: optionalString(formData, "brandFooter")
    }
  });

  revalidateCalculator(calculator.id, calculator.publicId);
  revalidatePath(buildPublicQuotePath(calculator));
  revalidatePath(buildPublicEmbedPath(calculator));
  redirect(`/dashboard/calculators/${calculator.id}`);
}

export async function createQuoteSubmissionAction(formData: FormData) {
  const calculatorId = requiredString(formData, "calculatorId", "");
  const calculatorSlug = requiredString(formData, "calculatorSlug", "");
  const calculatorPublicId = requiredString(formData, "calculatorPublicId", "");
  const returnTo = normalizeQuoteReturnPath(optionalString(formData, "returnTo"), calculatorPublicId, calculatorSlug);

  // Honeypot: real users never fill this hidden field. Pretend success so bots receive no signal.
  if (optionalString(formData, "companyWebsite")) {
    redirect(addQuoteReturnParam(returnTo, "submitted", "1"));
  }

  // Best-effort burst throttle keyed by calculator + hashed client IP (see lib/rate-limit.ts).
  const clientIpHash = hashIdentifier(getClientIp(await headers()));
  if (!checkRateLimit(`lead:${calculatorPublicId}:${clientIpHash}`, 5, 60_000)) {
    redirect(addQuoteReturnParam(returnTo, "submitted", "1"));
  }

  const calculator = await getQuoteCalculatorByPublicId(calculatorPublicId, calculatorSlug);

  if (!calculator || calculator.id !== calculatorId) {
    redirect(returnTo);
  }

  const acceptedLegalAcknowledgement = formData.get("acceptedLegalAcknowledgement") === "on";
  if (!acceptedLegalAcknowledgement) {
    redirect(addQuoteReturnParam(returnTo, "legal", "required"));
  }

  // Server-side validation defends the direct-POST surface; the client form validates these too.
  const customerName = cleanText(formData.get("customerName"), 120);
  const customerEmail = cleanText(formData.get("customerEmail"), 254);
  const customerPhone = cleanText(formData.get("customerPhone"), 40) || null;
  const customerNotes = cleanText(formData.get("customerNotes"), 2000) || null;

  if (!customerName || !isValidEmail(customerEmail)) {
    redirect(returnTo);
  }

  const rawAnswers: QuoteAnswers = Object.fromEntries(
    calculator.questions.map((question) => {
      const rawValue = formData.get(`answer_${question.id}`);
      return [question.id, question.questionType === "BOOLEAN" ? rawValue === "true" : cleanText(rawValue, 1000)];
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
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      answers,
      estimatedPrice: estimatedPrice.toFixed(2),
      // Record the actual posted consent (not a constant) plus which terms version was shown, so the
      // stored value is real evidence of what the customer agreed to.
      acceptedEstimateDisclaimer: acceptedLegalAcknowledgement,
      acceptedLegalTerms: acceptedLegalAcknowledgement,
      acceptedLegalVersion: acceptedLegalAcknowledgement ? legalLastUpdated : null,
      acceptedAt: acceptedLegalAcknowledgement ? new Date() : null
    }
  });

  // Mirror to Netlify Forms so the operator is notified of the new lead (best-effort; never blocks capture).
  await mirrorLeadToNetlify({
    calculator: calculator.name,
    customerName,
    customerEmail,
    customerPhone: customerPhone ?? "",
    estimate: estimatedPrice.toFixed(2),
    notes: customerNotes ?? ""
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/calculators");
  redirect(addQuoteReturnParam(returnTo, "submitted", "1"));
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
      publicId: true,
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

  revalidateCalculator(calculator.id, calculator.publicId);
  revalidatePath(buildPublicQuotePath(calculator));
  revalidatePath(buildPublicEmbedPath(calculator));
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
      publicId: true,
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

  revalidateCalculator(calculator.id, calculator.publicId);
  revalidatePath("/dashboard/leads");
  revalidatePath(buildPublicQuotePath(calculator));
  revalidatePath(buildPublicEmbedPath(calculator));
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

async function getWorkspaceCalculator(calculatorId: string, companyId: string) {
  return prisma.calculator.findFirst({
    where: {
      id: calculatorId,
      companyId,
      isArchived: false
    },
    select: {
      id: true,
      publicId: true,
      slug: true
    }
  });
}

function requiredString(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || fallback;
}

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalUrl(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function optionalHexColor(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
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

function parseOptionLabels(formData: FormData) {
  return formData
    .getAll("optionLabel")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function optionLabelsFrom(question: WorkspaceSaveQuestion) {
  return question.options.map((option) => option.label.trim()).filter(Boolean);
}

// Pricing rows for a workspace question (object form, as opposed to buildQuestionPricingRules' FormData form).
function buildPricingRulesFromQuestion(
  calculatorId: string,
  questionId: string,
  question: WorkspaceSaveQuestion
): Prisma.PricingRuleCreateManyInput[] {
  if (question.questionType === "SELECT") {
    return question.options
      .map((option, index) => ({ label: option.label.trim(), price: Number(option.price) || 0, index }))
      .filter((option) => option.label && option.price > 0)
      .map((option) => ({
        calculatorId,
        questionId,
        ruleType: "option_price",
        ruleConfig: { questionId, option: option.label },
        amount: option.price.toFixed(2),
        sortOrder: option.index
      }));
  }

  if (question.questionType === "NUMBER") {
    const amount = Number(question.unitPrice) || 0;
    return amount > 0
      ? [{ calculatorId, questionId, ruleType: "quantity_multiplier", ruleConfig: { questionId }, amount: amount.toFixed(2), sortOrder: 0 }]
      : [];
  }

  if (question.questionType === "BOOLEAN") {
    const amount = Number(question.addonPrice) || 0;
    return amount > 0
      ? [{ calculatorId, questionId, ruleType: "checkbox_addon", ruleConfig: { questionId }, amount: amount.toFixed(2), sortOrder: 0 }]
      : [];
  }

  return [];
}

// Turns a question's inline pricing inputs into the PricingRule rows that back it. Option/unit/add-on
// prices of 0 produce no rule (no effect on the quote). Index alignment between optionLabel/optionPrice
// is preserved because the editor renders each pair together in DOM order.
function buildQuestionPricingRules(
  calculatorId: string,
  questionId: string,
  questionType: QuoteQuestion["questionType"],
  formData: FormData
): Prisma.PricingRuleCreateManyInput[] {
  if (questionType === "SELECT") {
    const labels = formData.getAll("optionLabel").map((value) => String(value).trim());
    const prices = formData.getAll("optionPrice");
    const rules: Prisma.PricingRuleCreateManyInput[] = [];

    labels.forEach((label, index) => {
      const amount = currencyString(prices[index] ?? null);
      if (label && Number(amount) > 0) {
        rules.push({
          calculatorId,
          questionId,
          ruleType: "option_price",
          ruleConfig: { questionId, option: label },
          amount,
          sortOrder: index
        });
      }
    });

    return rules;
  }

  if (questionType === "NUMBER") {
    const amount = currencyString(formData.get("unitPrice"));
    return Number(amount) > 0
      ? [{ calculatorId, questionId, ruleType: "quantity_multiplier", ruleConfig: { questionId }, amount, sortOrder: 0 }]
      : [];
  }

  if (questionType === "BOOLEAN") {
    const amount = currencyString(formData.get("addonPrice"));
    return Number(amount) > 0
      ? [{ calculatorId, questionId, ruleType: "checkbox_addon", ruleConfig: { questionId }, amount, sortOrder: 0 }]
      : [];
  }

  return [];
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

function normalizeQuoteReturnPath(value: string | null, publicId: string, slug: string) {
  const quotePath = buildPublicQuotePath({ publicId, slug });
  const embedPath = buildPublicEmbedPath({ publicId, slug });

  if (!value) return quotePath;

  try {
    const url = new URL(value, "https://quotebuilder.local");

    if (url.origin !== "https://quotebuilder.local") return quotePath;

    if (url.pathname === quotePath || url.pathname === embedPath) {
      const params = new URLSearchParams();
      const embedded = url.searchParams.get("embedded") === "1";
      const returnUrl = normalizeExternalReturnUrl(url.searchParams.get("returnUrl"));
      const returnLabel = normalizeReturnLabel(url.searchParams.get("returnLabel"));

      if (embedded) params.set("embedded", "1");
      if (returnUrl) params.set("returnUrl", returnUrl);
      if (returnLabel) params.set("returnLabel", returnLabel);

      const query = params.toString();

      return query ? `${url.pathname}?${query}` : url.pathname;
    }
  } catch {
    return quotePath;
  }

  return quotePath;
}

function addQuoteReturnParam(path: string, key: "legal" | "submitted", value: string) {
  const url = new URL(path, "https://quotebuilder.local");
  url.searchParams.set(key, value);

  return `${url.pathname}?${url.searchParams.toString()}`;
}

function normalizeExternalReturnUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeReturnLabel(value: string | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 90);
}

function revalidateCalculator(calculatorId: string, publicId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calculators");
  revalidatePath(`/dashboard/calculators/${calculatorId}`);
  revalidatePath(`/preview/${calculatorId}`);

  // Invalidate the cached public calculator read (lib/calculator-data.ts) for just this calculator,
  // rather than busting every published quote/embed page on any single edit.
  if (publicId) {
    revalidateTag(`calculator:${publicId}`, "max");
  }
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function getClientIp(headerList: Headers) {
  return (
    headerList.get("x-nf-client-connection-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

async function mirrorLeadToNetlify(fields: Record<string, string>) {
  // Best-effort POST to the Netlify-registered form (public/__forms.html) so the operator gets a lead
  // notification. Wrapped so an unreachable/slow Netlify never blocks or fails lead capture.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    await fetch(`${getAppUrl()}/__forms.html`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "new-lead-notification", ...fields }).toString(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));
  } catch {
    // Intentionally ignored — notification is non-critical.
  }
}
