export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return "[binary]";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? String(value)
      : value.toFixed(6).replace(/\.?0+$/, "");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};
