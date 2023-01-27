const dateTimeFormat = new Intl.DateTimeFormat("de-AT", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export function formatDateTime(date?: Date | number): string {
  return date === undefined ? "–" : dateTimeFormat.format(date);
}

const numberFormat = new Intl.NumberFormat("de-AT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
export function formatNumber(v: number | undefined, unit = ""): string {
  if (!(typeof v === "number" && isFinite(v))) return "–";
  const string = numberFormat.format(v);
  if (!unit) return string;
  return `${string}\u202F${unit}`;
}
