export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (Array.isArray(value)) {
      result[snakeKey] = value.map((v) =>
        typeof v === "object" && v !== null ? toSnakeCase(v as Record<string, unknown>) : v
      );
    } else if (value !== null && typeof value === "object") {
      result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}
