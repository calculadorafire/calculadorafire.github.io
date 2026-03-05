export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPercent(value: number): string {
  return (value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
}

export function parseBRL(value: string): number {
  const cleaned = value
    .replace(/R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function toAnnual(value: number, period: "mensal" | "anual"): number {
  return period === "mensal" ? value * 12 : value;
}
