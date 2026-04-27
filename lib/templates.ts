export type CalculatorTemplate = {
  id: string;
  name: string;
  description: string;
  businessType: string;
  accent: string;
};

export const calculatorTemplates: CalculatorTemplate[] = [
  {
    id: "home-services",
    name: "Home Services Quote",
    description: "A clean starter for contractors, remodelers, landscapers, and repair teams.",
    businessType: "Home services",
    accent: "bg-teal-700"
  },
  {
    id: "professional-services",
    name: "Professional Services Quote",
    description: "Start a consultative quote flow for agencies, consultants, and implementation teams.",
    businessType: "Professional services",
    accent: "bg-ink"
  },
  {
    id: "managed-it",
    name: "Managed IT Quote",
    description: "Create a services estimate foundation for device counts, support tiers, and add-ons.",
    businessType: "IT services",
    accent: "bg-blue-700"
  },
  {
    id: "cleaning-services",
    name: "Cleaning Services Quote",
    description: "A simple base for recurring service estimates, property details, and package options.",
    businessType: "Cleaning services",
    accent: "bg-amber-700"
  }
];

export function getCalculatorTemplateById(id: string) {
  return calculatorTemplates.find((template) => template.id === id) ?? null;
}
