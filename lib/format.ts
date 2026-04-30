export function formatCurrency(amount: number, opts?: { compact?: boolean }): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (opts?.compact && abs >= 1000) {
    if (abs >= 1_000_000) {
      return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M MAD`;
    }
    if (abs >= 10_000) {
      return `${sign}${(abs / 1000).toFixed(0)}k MAD`;
    }
    return `${sign}${(abs / 1000).toFixed(1)}k MAD`;
  }
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted} MAD`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso: string, format: "short" | "long" | "month" = "short"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  if (format === "long") {
    return `${MONTHS_LONG[m]} ${day}, ${y}`;
  }
  if (format === "month") {
    return `${MONTHS_SHORT[m]} ${y}`;
  }
  return `${MONTHS_SHORT[m]} ${day}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 0 && diff < 7) return `${diff} days ago`;
  return formatDate(iso, "short");
}
