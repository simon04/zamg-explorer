import { format } from "date-fns";
import { deAT } from "date-fns/locale";

export const displayFormats = Object.freeze({
  datetime: "yyyy-MM-dd HH:mm zz",
  millisecond: "HH:mm:ss.SSS",
  second: "HH:mm:ss",
  minute: "HH:mm",
  hour: "HH\u2070\u2070",
  day: "d. MMM",
  week: "PP",
  month: "MMM yyyy",
  quarter: "qqq yyyy",
  year: "yyyy",
});

export function formatDate(date: Date | number): string {
  if (!date) return "";
  return format(date, displayFormats.datetime, { locale: deAT });
}
