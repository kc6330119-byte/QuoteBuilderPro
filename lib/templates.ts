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
  },
  {
    id: "bathroom-remodel",
    name: "Bathroom Remodel",
    description: "Estimate bathroom remodels by bathroom type, finish level, shower or tub scope, tile area, vanity, fixtures, and layout changes.",
    businessType: "Remodeling",
    accent: "bg-cyan-700",
    questions: [
      {
        label: "Bathroom type",
        type: "select",
        options: ["Powder room", "Guest bathroom", "Primary bathroom", "Accessible bathroom"],
        required: true
      },
      {
        label: "Finish level",
        type: "select",
        options: ["Standard", "Upgraded", "Premium"],
        required: true
      },
      {
        label: "Shower or tub scope",
        type: "select",
        options: ["Keep existing", "Tub replacement", "Walk-in shower", "Custom tile shower", "Tub and shower conversion"],
        required: true
      },
      {
        label: "Tile square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Vanity package",
        type: "select",
        options: ["Keep existing vanity", "Standard vanity", "Double vanity", "Custom vanity"],
        required: true
      },
      {
        label: "Move plumbing fixtures",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Add lighting or ventilation upgrades",
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
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 9500 },
      { ruleType: "option_price", questionLabel: "Bathroom type", matchValue: "Guest bathroom", amount: 3500 },
      { ruleType: "option_price", questionLabel: "Bathroom type", matchValue: "Primary bathroom", amount: 7500 },
      { ruleType: "option_price", questionLabel: "Bathroom type", matchValue: "Accessible bathroom", amount: 6000 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Upgraded", amount: 5500 },
      { ruleType: "option_price", questionLabel: "Finish level", matchValue: "Premium", amount: 13000 },
      { ruleType: "option_price", questionLabel: "Shower or tub scope", matchValue: "Tub replacement", amount: 3500 },
      { ruleType: "option_price", questionLabel: "Shower or tub scope", matchValue: "Walk-in shower", amount: 7000 },
      { ruleType: "option_price", questionLabel: "Shower or tub scope", matchValue: "Custom tile shower", amount: 12000 },
      { ruleType: "option_price", questionLabel: "Shower or tub scope", matchValue: "Tub and shower conversion", amount: 9000 },
      { ruleType: "quantity_multiplier", questionLabel: "Tile square feet", matchValue: null, amount: 28 },
      { ruleType: "option_price", questionLabel: "Vanity package", matchValue: "Standard vanity", amount: 2200 },
      { ruleType: "option_price", questionLabel: "Vanity package", matchValue: "Double vanity", amount: 4200 },
      { ruleType: "option_price", questionLabel: "Vanity package", matchValue: "Custom vanity", amount: 7200 },
      { ruleType: "checkbox_addon", questionLabel: "Move plumbing fixtures", matchValue: true, amount: 4500 },
      { ruleType: "checkbox_addon", questionLabel: "Add lighting or ventilation upgrades", matchValue: true, amount: 1800 },
      { ruleType: "checkbox_addon", questionLabel: "Permit or design support needed", matchValue: true, amount: 1200 }
    ]
  },
  {
    id: "roofing-gutters",
    name: "Roofing & Gutters",
    description: "Estimate roofing and gutter projects by roof size, material, pitch, tear-off, stories, gutters, and repair needs.",
    businessType: "Roofing",
    accent: "bg-slate-700",
    questions: [
      {
        label: "Roof square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Roof material",
        type: "select",
        options: ["Architectural shingles", "Metal roofing", "Premium shingles", "Flat roofing"],
        required: true
      },
      {
        label: "Roof pitch",
        type: "select",
        options: ["Low / walkable", "Moderate", "Steep", "Very steep or complex"],
        required: true
      },
      {
        label: "Number of stories",
        type: "select",
        options: ["1 story", "2 stories", "3+ stories"],
        required: true
      },
      {
        label: "Gutter linear feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Remove existing roof",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Decking repair likely",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Add gutter guards",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 1500 },
      { ruleType: "quantity_multiplier", questionLabel: "Roof square feet", matchValue: null, amount: 6.75 },
      { ruleType: "option_price", questionLabel: "Roof material", matchValue: "Metal roofing", amount: 8500 },
      { ruleType: "option_price", questionLabel: "Roof material", matchValue: "Premium shingles", amount: 4200 },
      { ruleType: "option_price", questionLabel: "Roof material", matchValue: "Flat roofing", amount: 3000 },
      { ruleType: "option_price", questionLabel: "Roof pitch", matchValue: "Steep", amount: 2500 },
      { ruleType: "option_price", questionLabel: "Roof pitch", matchValue: "Very steep or complex", amount: 5500 },
      { ruleType: "option_price", questionLabel: "Number of stories", matchValue: "2 stories", amount: 1800 },
      { ruleType: "option_price", questionLabel: "Number of stories", matchValue: "3+ stories", amount: 3500 },
      { ruleType: "quantity_multiplier", questionLabel: "Gutter linear feet", matchValue: null, amount: 12 },
      { ruleType: "checkbox_addon", questionLabel: "Remove existing roof", matchValue: true, amount: 2800 },
      { ruleType: "checkbox_addon", questionLabel: "Decking repair likely", matchValue: true, amount: 1800 },
      { ruleType: "checkbox_addon", questionLabel: "Add gutter guards", matchValue: true, amount: 1400 }
    ]
  },
  {
    id: "hvac-replacement",
    name: "HVAC Replacement",
    description: "Estimate HVAC replacement by system type, home size, efficiency level, ductwork, zones, and installation urgency.",
    businessType: "HVAC",
    accent: "bg-sky-700",
    questions: [
      {
        label: "System type",
        type: "select",
        options: ["AC only", "Furnace only", "Heat pump", "Full HVAC system"],
        required: true
      },
      {
        label: "Home square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Efficiency level",
        type: "select",
        options: ["Standard efficiency", "High efficiency", "Premium variable speed"],
        required: true
      },
      {
        label: "Ductwork condition",
        type: "select",
        options: ["Existing ducts are good", "Minor duct repairs", "Major duct replacement"],
        required: true
      },
      {
        label: "Number of zones",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Smart thermostat",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Emergency or rush install",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 4800 },
      { ruleType: "option_price", questionLabel: "System type", matchValue: "Furnace only", amount: 800 },
      { ruleType: "option_price", questionLabel: "System type", matchValue: "Heat pump", amount: 2600 },
      { ruleType: "option_price", questionLabel: "System type", matchValue: "Full HVAC system", amount: 5200 },
      { ruleType: "quantity_multiplier", questionLabel: "Home square feet", matchValue: null, amount: 1.25 },
      { ruleType: "option_price", questionLabel: "Efficiency level", matchValue: "High efficiency", amount: 1800 },
      { ruleType: "option_price", questionLabel: "Efficiency level", matchValue: "Premium variable speed", amount: 4200 },
      { ruleType: "option_price", questionLabel: "Ductwork condition", matchValue: "Minor duct repairs", amount: 1500 },
      { ruleType: "option_price", questionLabel: "Ductwork condition", matchValue: "Major duct replacement", amount: 6500 },
      { ruleType: "quantity_multiplier", questionLabel: "Number of zones", matchValue: null, amount: 900 },
      { ruleType: "checkbox_addon", questionLabel: "Smart thermostat", matchValue: true, amount: 350 },
      { ruleType: "checkbox_addon", questionLabel: "Emergency or rush install", matchValue: true, amount: 1200 }
    ]
  },
  {
    id: "landscaping-hardscaping",
    name: "Landscaping / Hardscaping",
    description: "Estimate outdoor projects by service type, lawn or patio size, design level, grading, irrigation, planting, and lighting.",
    businessType: "Landscaping",
    accent: "bg-emerald-700",
    questions: [
      {
        label: "Project type",
        type: "select",
        options: ["Landscape refresh", "New lawn / sod", "Paver patio", "Retaining wall", "Full outdoor makeover"],
        required: true
      },
      {
        label: "Project square feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Design level",
        type: "select",
        options: ["Basic", "Upgraded", "Premium"],
        required: true
      },
      {
        label: "Grading or drainage needed",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Irrigation needed",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Planting package",
        type: "select",
        options: ["None", "Basic planting", "Upgraded planting", "Premium planting"],
        required: true
      },
      {
        label: "Outdoor lighting",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 1200 },
      { ruleType: "quantity_multiplier", questionLabel: "Project square feet", matchValue: null, amount: 8 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "New lawn / sod", amount: 1800 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Paver patio", amount: 4500 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Retaining wall", amount: 6500 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Full outdoor makeover", amount: 9500 },
      { ruleType: "option_price", questionLabel: "Design level", matchValue: "Upgraded", amount: 2500 },
      { ruleType: "option_price", questionLabel: "Design level", matchValue: "Premium", amount: 6000 },
      { ruleType: "checkbox_addon", questionLabel: "Grading or drainage needed", matchValue: true, amount: 2800 },
      { ruleType: "checkbox_addon", questionLabel: "Irrigation needed", matchValue: true, amount: 4200 },
      { ruleType: "option_price", questionLabel: "Planting package", matchValue: "Basic planting", amount: 1500 },
      { ruleType: "option_price", questionLabel: "Planting package", matchValue: "Upgraded planting", amount: 3500 },
      { ruleType: "option_price", questionLabel: "Planting package", matchValue: "Premium planting", amount: 7500 },
      { ruleType: "checkbox_addon", questionLabel: "Outdoor lighting", matchValue: true, amount: 2200 }
    ]
  },
  {
    id: "deck-fence-patio",
    name: "Deck / Fence / Patio",
    description: "Estimate outdoor living projects by project type, size, material, demolition, railings, stairs, gates, and permit needs.",
    businessType: "Outdoor living",
    accent: "bg-orange-700",
    questions: [
      {
        label: "Project type",
        type: "select",
        options: ["Deck", "Fence", "Patio", "Deck and patio"],
        required: true
      },
      {
        label: "Project size",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Material",
        type: "select",
        options: ["Pressure-treated wood", "Cedar", "Composite", "Pavers", "Aluminum / vinyl"],
        required: true
      },
      {
        label: "Remove existing structure",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Railing linear feet",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Stairs or steps",
        type: "checkbox",
        options: [],
        required: false
      },
      {
        label: "Gates needed",
        type: "number",
        options: [],
        required: true
      },
      {
        label: "Permit or design support needed",
        type: "checkbox",
        options: [],
        required: false
      }
    ],
    pricingRules: [
      { ruleType: "base_price", questionLabel: null, matchValue: null, amount: 1800 },
      { ruleType: "quantity_multiplier", questionLabel: "Project size", matchValue: null, amount: 38 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Fence", amount: 1200 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Patio", amount: 2200 },
      { ruleType: "option_price", questionLabel: "Project type", matchValue: "Deck and patio", amount: 5500 },
      { ruleType: "option_price", questionLabel: "Material", matchValue: "Cedar", amount: 2500 },
      { ruleType: "option_price", questionLabel: "Material", matchValue: "Composite", amount: 6500 },
      { ruleType: "option_price", questionLabel: "Material", matchValue: "Pavers", amount: 4000 },
      { ruleType: "option_price", questionLabel: "Material", matchValue: "Aluminum / vinyl", amount: 3500 },
      { ruleType: "checkbox_addon", questionLabel: "Remove existing structure", matchValue: true, amount: 2500 },
      { ruleType: "quantity_multiplier", questionLabel: "Railing linear feet", matchValue: null, amount: 55 },
      { ruleType: "checkbox_addon", questionLabel: "Stairs or steps", matchValue: true, amount: 1800 },
      { ruleType: "quantity_multiplier", questionLabel: "Gates needed", matchValue: null, amount: 450 },
      { ruleType: "checkbox_addon", questionLabel: "Permit or design support needed", matchValue: true, amount: 900 }
    ]
  }
];

export function getCalculatorTemplateById(id: string) {
  return calculatorTemplates.find((template) => template.id === id) ?? null;
}
