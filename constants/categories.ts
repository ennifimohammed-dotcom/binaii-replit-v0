import { Feather } from "@expo/vector-icons";

export type CategoryId =
  | "materials"
  | "labor"
  | "equipment"
  | "transport"
  | "permits"
  | "utilities"
  | "subcontractor"
  | "tools"
  | "safety"
  | "misc";

export type Category = {
  id: CategoryId;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  keywords: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "materials",
    label: "Materials",
    icon: "package",
    color: "#C8A65A",
    keywords: [
      "cement",
      "ciment",
      "sand",
      "sable",
      "gravel",
      "brick",
      "brique",
      "steel",
      "rebar",
      "fer",
      "wood",
      "bois",
      "tile",
      "carrelage",
      "paint",
      "peinture",
      "concrete",
      "beton",
      "plaster",
      "platre",
      "block",
      "parpaing",
      "matériaux",
      "material",
    ],
  },
  {
    id: "labor",
    label: "Labor",
    icon: "users",
    color: "#2D7DD2",
    keywords: [
      "labor",
      "labour",
      "worker",
      "ouvrier",
      "mason",
      "maçon",
      "wage",
      "salaire",
      "salary",
      "main d'œuvre",
      "manoeuvre",
      "salaire",
      "payroll",
    ],
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: "settings",
    color: "#475569",
    keywords: [
      "equipment",
      "matériel",
      "crane",
      "grue",
      "excavator",
      "pelle",
      "scaffold",
      "échafaud",
      "mixer",
      "betonnière",
      "rental",
      "location",
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: "truck",
    color: "#0EA5E9",
    keywords: [
      "transport",
      "delivery",
      "livraison",
      "fuel",
      "carburant",
      "diesel",
      "gas",
      "essence",
      "truck",
      "camion",
      "freight",
      "trip",
    ],
  },
  {
    id: "permits",
    label: "Permits & Fees",
    icon: "file-text",
    color: "#7C3AED",
    keywords: [
      "permit",
      "permis",
      "license",
      "fee",
      "frais",
      "tax",
      "taxe",
      "stamp",
      "timbre",
      "registration",
      "legal",
      "notaire",
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: "zap",
    color: "#D97706",
    keywords: [
      "electric",
      "electricity",
      "électricité",
      "water",
      "eau",
      "power",
      "courant",
      "phone",
      "internet",
      "facture",
      "bill",
    ],
  },
  {
    id: "subcontractor",
    label: "Subcontractor",
    icon: "briefcase",
    color: "#EC4899",
    keywords: [
      "subcontract",
      "sous-traitant",
      "plumber",
      "plombier",
      "electrician",
      "electricien",
      "tiler",
      "carreleur",
      "painter",
      "peintre",
      "carpenter",
      "menuisier",
      "welder",
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "tool",
    color: "#1F9D55",
    keywords: [
      "tool",
      "outil",
      "drill",
      "perceuse",
      "hammer",
      "marteau",
      "saw",
      "scie",
      "shovel",
      "pelle",
      "wheelbarrow",
      "brouette",
    ],
  },
  {
    id: "safety",
    label: "Safety",
    icon: "shield",
    color: "#E5484D",
    keywords: [
      "helmet",
      "casque",
      "safety",
      "sécurité",
      "gloves",
      "gants",
      "boots",
      "bottes",
      "vest",
      "gilet",
      "harness",
      "first aid",
    ],
  },
  {
    id: "misc",
    label: "Miscellaneous",
    icon: "more-horizontal",
    color: "#6B7384",
    keywords: ["misc", "divers", "other", "autre"],
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

export function getCategory(id: CategoryId): Category {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.misc;
}

export function suggestCategory(description: string): CategoryId {
  const lower = description.toLowerCase();
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return cat.id;
      }
    }
  }
  return "misc";
}
