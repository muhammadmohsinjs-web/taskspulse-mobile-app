export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  appliesTo: "task" | "habit" | "both";
  createdAt: string;
}

export interface CategoryRaw {
  id: string;
  name: string;
  color: string;
  icon: string;
  applies_to: string;
  created_at: string;
}

function validateAppliesTo(a: string): Category["appliesTo"] {
  const valid: Category["appliesTo"][] = ["task", "habit", "both"];
  return valid.includes(a as Category["appliesTo"]) ? (a as Category["appliesTo"]) : "both";
}

export function mapCategory(raw: CategoryRaw): Category {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    icon: raw.icon,
    appliesTo: validateAppliesTo(raw.applies_to),
    createdAt: raw.created_at,
  };
}

export interface CategoryCreatePayload {
  name: string;
  color?: string;
  icon?: string;
  appliesTo?: string;
}

export interface CategoryUpdatePayload {
  name?: string;
  color?: string;
  icon?: string;
  appliesTo?: string;
}
