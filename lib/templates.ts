export type TemplateQuestionType = "number" | "select" | "checkbox";

export type TemplateQuestion = {
  label: string;
  type: TemplateQuestionType;
  options: string[];
  required: boolean;
};

export type TemplatePricingRule = {
  ruleType: "base_price" | "quantity_multiplier" | "option_price" | "checkbox_addon";
  questionLabel: string | null;
  matchValue: string | number | boolean | null;
  amount: number;
};

export type CalculatorTemplate = {
  id: string;
  name: string;
  description: string;
  businessType: string;
  accent: string;
  questions: TemplateQuestion[];
  pricingRules: TemplatePricingRule[];
};

export const calculatorTemplates: CalculatorTemplate[] = [
  {
    id: "general-contractor-home-builder",
    name: "General Contractor / Home Builder",
    description: "Estimate residential builds, additions, remodels, and detached structures with project scope and finish-level pricing.",
    businessType: "Construction",
    accent: "bg-amber-700",
    questions: [
      {
        label: "Project type",
        type: "select",
        options: ["New home build", "Addition", "Remodel", "Garage / outbuilding"],
        required: true
      },
      {
        label: "Estimated square footage",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Finish level",
        type: "select",
        options: ["Standard", "Upgraded", "Premium"],
        required: true
      },
      {
        label: "Site preparation needed",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Timeline",
        type: "select",
        options: ["Flexible", "Standard", "Rush"],
        required: true
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 5000 },
      { ruleType: "quantity_multiplier", questionLabel: "Estimated square footage", matchValue: null, amount: 185 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Addition", amount: 7500 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Remodel", amount: 3500 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Garage / outbuilding", amount: 2500 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Upgraded", amount: 25000 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Premium", amount: 65000 },
      { ruleType: "checkbox_addon", questionLabel: "Site preparation needed", matchValue: true, amount: 8500 },
      { ruleType: "option_price", questionLabel: "Timeline", matchValue: "Rush", amount: 12000 }
    ]
  },
  {
    id: "rolloff-container-rental",
    name: "Rolloff Container Rental",
    description: "Quote dumpster rentals by container size, rental duration, material type, delivery distance, and rush delivery.",
    businessType: "Waste services",
    accent: "bg-teal-700",
    questions: [
      {
        label: "Container size",
        type: "select",
        options: ["10 yard", "15 yard", "20 yard", "30 yard", "40 yard"],
        required: true
      },
      {
        label: "Rental duration days",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Waste type",
        type: "select",
        options: ["Household debris", "Construction debris", "Concrete / heavy material", "Yard waste"],
        required: true
      },
      {
        label: "Delivery distance miles",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Need same-day delivery",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 250 },
      { ruleType: "option_price", questionLabel: "Container size", matchValue: "15 yard", amount: 75 },
      { ruleType: "option_price", questionLabel: "Container size", matchValue: "20 yard", amount: 150 },
      { ruleType: "option_price", questionLabel: "Container size", matchValue: "30 yard", amount: 275 },
      { ruleType: "option_price", questionLabel: "Container size", matchValue: "40 yard", amount: 425 },
      { ruleType: "quantity_multiplier", questionLabel: "Rental duration days", matchValue: null, amount: 12 },
      { ruleType: "quantity_multiplier", questionLabel: "Delivery distance miles", matchValue: null, amount: 4 },
      { ruleType: "option_price", questionLabel: "Waste type", matchValue: "Concrete / heavy material", amount: 125 },
      { ruleType: "checkbox_addon", questionLabel: "Need same-day delivery", matchValue: true, amount: 95 }
    ]
  },
  {
    id: "kitchen-remodel",
    name: "Kitchen Remodel",
    description: "Estimate kitchen remodel projects by finish level, cabinets, flooring, countertops, island options, appliances, and layout changes.",
    businessType: "Remodeling",
    accent: "bg-blue-700",
    questions: [
      {
        label: "Finish level",
        type: "select",
        options: ["Standard", "Upgraded", "Premium"],
        required: true
      },
      {
        label: "Cabinet package",
        type: "select",
        options: ["Keep existing cabinets", "Standard cabinet replacement", "Upgraded cabinets", "Premium custom cabinets"],
        required: true
      },
      {
        label: "Flooring square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Countertop square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Island option",
        type: "select",
        options: ["No island", "Small prep island", "Large island with seating", "Island with sink or cooktop"],
        required: true
      },
      {
        label: "Appliance package",
        type: "select",
        options: ["Reuse existing appliances", "Standard appliance allowance", "Upgraded appliance allowance", "Premium pro-style appliance allowance"],
        required: true
      },
      {
        label: "Change kitchen layout",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Plumbing or electrical updates",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Permit or design support needed",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 20000 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Upgraded", amount: 10000 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Premium", amount: 30000 },
      { ruleType: "option_price", questionLabel: "Cabinet package", matchValue: "Standard cabinet replacement", amount: 8500 },
      { ruleType: "option_price", questionLabel: "Cabinet package", matchValue: "Upgraded cabinets", amount: 16000 },
      { ruleType: "option_price", questionLabel: "Cabinet package", matchValue: "Premium custom cabinets", amount: 28000 },
      { ruleType: "quantity_multiplier", questionLabel: "Flooring square feet", matchValue: null, amount: 14 },
      { ruleType: "quantity_multiplier", questionLabel: "Countertop square feet", matchValue: null, amount: 85 },
      { ruleType: "option_price", questionLabel: "Island option", matchValue: "Small prep island", amount: 4500 },
      { ruleType: "option_price", questionLabel: "Island option", matchValue: "Large island with seating", amount: 8500 },
      { ruleType: "option_price", questionLabel: "Island option", matchValue: "Island with sink or cooktop", amount: 14000 },
      { ruleType: "option_price", questionLabel: "Appliance package", matchValue: "Standard appliance allowance", amount: 5000 },
      { ruleType: "option_price", questionLabel: "Appliance package", matchValue: "Upgraded appliance allowance", amount: 9500 },
      { ruleType: "option_price", questionLabel: "Appliance package", matchValue: "Premium pro-style appliance allowance", amount: 18000 },
      { ruleType: "checkbox_addon", questionLabel: "Change kitchen layout", matchValue: true, amount: 7500 },
      { ruleType: "checkbox_addon", questionLabel: "Plumbing or electrical updates", matchValue: true, amount: 4500 },
      { ruleType: "checkbox_addon", questionLabel: "Permit or design support needed", matchValue: true, amount: 1500 }
    ]
  }
];

export function getCalculatorTemplateById(id: string) {
  return calculatorTemplates.find((template) => template.id === id) ?? null;
}
