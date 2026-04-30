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

export function mapCategory(raw: CategoryRaw): Category {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    icon: raw.icon,
    appliesTo: raw.applies_to as Category["appliesTo"],
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
