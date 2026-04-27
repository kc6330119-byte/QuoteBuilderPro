export type QuoteOption = {
  label: string;
  value: string;
  priceDelta: number;
};

export type CalculatorField = {
  id: string;
  label: string;
  key: string;
  type: "NUMBER" | "SELECT" | "BOOLEAN" | "TEXT";
  unit?: string;
  required?: boolean;
  min?: number;
  max?: number;
  pricePerUnit?: number;
  priceDelta?: number;
  options?: QuoteOption[];
};

export type Calculator = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  currency: string;
  basePrice: number;
  leads: number;
  conversionRate: number;
  avgQuote: number;
  updatedAt: string;
  publishedAt?: string;
  fields: CalculatorField[];
};

export type Lead = {
  id: string;
  calculatorName: string;
  customerName: string;
  email: string;
  company: string;
  totalCents: number;
  status: "NEW" | "CONTACTED" | "WON" | "LOST";
  createdAt: string;
};

export const calculators: Calculator[] = [
  {
    id: "calc-1",
    name: "Managed IT Services Quote",
    slug: "managed-it-services",
    description: "Monthly support pricing for device management, helpdesk, and security add-ons.",
    status: "PUBLISHED",
    currency: "USD",
    basePrice: 150000,
    leads: 42,
    conversionRate: 18,
    avgQuote: 835000,
    updatedAt: "2026-04-20",
    publishedAt: "2026-03-28",
    fields: [
      {
        id: "field-1",
        label: "Number of employees",
        key: "employees",
        type: "NUMBER",
        unit: "people",
        min: 5,
        max: 500,
        pricePerUnit: 12500
      },
      {
        id: "field-2",
        label: "Support level",
        key: "support_level",
        type: "SELECT",
        options: [
          { label: "Business hours", value: "business", priceDelta: 0 },
          { label: "Extended support", value: "extended", priceDelta: 125000 },
          { label: "24/7 priority", value: "priority", priceDelta: 275000 }
        ]
      },
      {
        id: "field-3",
        label: "Include endpoint security",
        key: "endpoint_security",
        type: "BOOLEAN",
        priceDelta: 95000
      }
    ]
  },
  {
    id: "calc-2",
    name: "Commercial Cleaning Estimate",
    slug: "commercial-cleaning",
    description: "Facility quote builder with square footage, visit cadence, and specialty services.",
    status: "PUBLISHED",
    currency: "USD",
    basePrice: 45000,
    leads: 31,
    conversionRate: 24,
    avgQuote: 212000,
    updatedAt: "2026-04-16",
    publishedAt: "2026-04-02",
    fields: [
      {
        id: "field-4",
        label: "Square footage",
        key: "square_footage",
        type: "NUMBER",
        unit: "sq ft",
        min: 500,
        max: 50000,
        pricePerUnit: 18
      },
      {
        id: "field-5",
        label: "Visits per week",
        key: "visits",
        type: "SELECT",
        options: [
          { label: "One", value: "one", priceDelta: 0 },
          { label: "Three", value: "three", priceDelta: 55000 },
          { label: "Five", value: "five", priceDelta: 115000 }
        ]
      }
    ]
  },
  {
    id: "calc-3",
    name: "Custom Software Discovery",
    slug: "software-discovery",
    description: "Early discovery quote for workshops, technical audits, and roadmap deliverables.",
    status: "DRAFT",
    currency: "USD",
    basePrice: 350000,
    leads: 8,
    conversionRate: 12,
    avgQuote: 590000,
    updatedAt: "2026-04-11",
    fields: [
      {
        id: "field-6",
        label: "Stakeholder interviews",
        key: "interviews",
        type: "NUMBER",
        unit: "sessions",
        min: 2,
        max: 20,
        pricePerUnit: 45000
      },
      {
        id: "field-7",
        label: "Architecture review",
        key: "architecture_review",
        type: "BOOLEAN",
        priceDelta: 180000
      }
    ]
  }
];

export const leads: Lead[] = [
  {
    id: "lead-1",
    calculatorName: "Managed IT Services Quote",
    customerName: "Maya Fernandez",
    email: "maya@northline.example",
    company: "Northline Clinics",
    totalCents: 975000,
    status: "NEW",
    createdAt: "2026-04-25"
  },
  {
    id: "lead-2",
    calculatorName: "Commercial Cleaning Estimate",
    customerName: "Andre Wallace",
    email: "andre@marshandco.example",
    company: "Marsh & Co",
    totalCents: 284000,
    status: "CONTACTED",
    createdAt: "2026-04-24"
  },
  {
    id: "lead-3",
    calculatorName: "Managed IT Services Quote",
    customerName: "Priya Shah",
    email: "priya@oakledger.example",
    company: "Oakledger Finance",
    totalCents: 742500,
    status: "WON",
    createdAt: "2026-04-22"
  },
  {
    id: "lead-4",
    calculatorName: "Custom Software Discovery",
    customerName: "Graham Lee",
    email: "graham@brighterops.example",
    company: "BrighterOps",
    totalCents: 610000,
    status: "NEW",
    createdAt: "2026-04-21"
  }
];

export function getCalculatorBySlug(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}
