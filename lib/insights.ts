import { CATEGORY_MAP, CategoryId } from "@/constants/categories";
import { Budget, Expense } from "@/lib/storage";

export type Insight = {
  id: string;
  kind: "warning" | "info" | "positive" | "tip";
  title: string;
  detail: string;
  icon: "trending-up" | "trending-down" | "alert-triangle" | "check-circle" | "dollar-sign" | "activity" | "info";
};

export type HealthScore = {
  score: number;
  label: string;
  detail: string;
};

function monthKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function computeHealthScore(
  expenses: Expense[],
  budgets: Budget[],
): HealthScore {
  if (expenses.length === 0) {
    return {
      score: 100,
      label: "Excellent",
      detail: "No spending recorded yet — your books are pristine.",
    };
  }

  let score = 100;

  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);

  const totalsByMonth: Record<string, number> = {};
  const totalsByCategory: Record<string, number> = {};
  for (const e of expenses) {
    const mk = monthKey(e.date);
    totalsByMonth[mk] = (totalsByMonth[mk] ?? 0) + e.amount;
    if (mk === thisMonth) {
      totalsByCategory[e.category] = (totalsByCategory[e.category] ?? 0) + e.amount;
    }
  }

  const thisTotal = totalsByMonth[thisMonth] ?? 0;
  const lastTotal = totalsByMonth[lastMonth] ?? 0;

  if (lastTotal > 0) {
    const change = (thisTotal - lastTotal) / lastTotal;
    if (change > 0.4) score -= 25;
    else if (change > 0.2) score -= 15;
    else if (change > 0.1) score -= 8;
    else if (change < -0.1) score += 5;
  }

  const globalBudget = budgets.find((b) => b.scope === "global");
  if (globalBudget && globalBudget.amount > 0) {
    const used = thisTotal / globalBudget.amount;
    if (used > 1) score -= 30;
    else if (used > 0.9) score -= 18;
    else if (used > 0.75) score -= 8;
  }

  for (const b of budgets) {
    if (b.scope !== "category" || !b.categoryId) continue;
    const used = (totalsByCategory[b.categoryId] ?? 0) / Math.max(b.amount, 1);
    if (used > 1.1) score -= 10;
    else if (used > 0.95) score -= 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Excellent";
  let detail = "Spending is well controlled and within plan.";
  if (score < 40) {
    label = "Critical";
    detail = "Multiple categories are exceeding budget — review and adjust.";
  } else if (score < 60) {
    label = "Stressed";
    detail = "Spending is rising faster than usual. Trim non-essentials.";
  } else if (score < 80) {
    label = "Healthy";
    detail = "On track overall, with a few areas to keep an eye on.";
  }

  return { score, label, detail };
}

export function generateInsights(
  expenses: Expense[],
  budgets: Budget[],
): Insight[] {
  const insights: Insight[] = [];
  if (expenses.length === 0) {
    insights.push({
      id: "welcome",
      kind: "tip",
      title: "Start tracking",
      detail: "Log your first expense to unlock insights and trends.",
      icon: "info",
    });
    return insights;
  }

  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const monthCategoryTotals: Record<string, Record<string, number>> = {};
  const monthTotals: Record<string, number> = {};
  for (const e of expenses) {
    const mk = monthKey(e.date);
    monthTotals[mk] = (monthTotals[mk] ?? 0) + e.amount;
    if (!monthCategoryTotals[mk]) monthCategoryTotals[mk] = {};
    monthCategoryTotals[mk]![e.category] =
      (monthCategoryTotals[mk]![e.category] ?? 0) + e.amount;
  }

  const thisTotal = monthTotals[thisMonth] ?? 0;
  const lastTotal = monthTotals[lastMonth] ?? 0;

  if (lastTotal > 0 && thisTotal > 0) {
    const change = ((thisTotal - lastTotal) / lastTotal) * 100;
    if (change >= 15) {
      insights.push({
        id: "month-up",
        kind: "warning",
        title: `Monthly spend up ${Math.round(change)}%`,
        detail: `You spent ${Math.round(change)}% more this month compared to last. Pace is accelerating.`,
        icon: "trending-up",
      });
    } else if (change <= -10) {
      insights.push({
        id: "month-down",
        kind: "positive",
        title: `Down ${Math.round(Math.abs(change))}% vs last month`,
        detail: "Excellent discipline — keep this pace and you'll comfortably stay under plan.",
        icon: "trending-down",
      });
    }
  }

  const thisCats = monthCategoryTotals[thisMonth] ?? {};
  const lastCats = monthCategoryTotals[lastMonth] ?? {};
  const catChanges: { id: string; change: number; abs: number }[] = [];
  for (const [cat, value] of Object.entries(thisCats)) {
    const prev = lastCats[cat] ?? 0;
    if (prev > 0) {
      const change = ((value - prev) / prev) * 100;
      catChanges.push({ id: cat, change, abs: value - prev });
    }
  }
  catChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const top = catChanges[0];
  if (top && Math.abs(top.change) >= 25) {
    const cat = CATEGORY_MAP[top.id as CategoryId];
    if (cat) {
      insights.push({
        id: `cat-${top.id}`,
        kind: top.change > 0 ? "warning" : "positive",
        title:
          top.change > 0
            ? `${cat.label} cost up ${Math.round(top.change)}%`
            : `${cat.label} down ${Math.round(Math.abs(top.change))}%`,
        detail:
          top.change > 0
            ? `${cat.label} expenses jumped this month — investigate for cost control.`
            : `${cat.label} expenses dropped — sustainable savings if you keep it up.`,
        icon: top.change > 0 ? "trending-up" : "trending-down",
      });
    }
  }

  for (const b of budgets) {
    if (b.scope === "global" && b.amount > 0) {
      const used = (thisTotal / b.amount) * 100;
      if (used >= 100) {
        insights.push({
          id: "budget-global-over",
          kind: "warning",
          title: "Monthly budget exceeded",
          detail: `You've used ${Math.round(used)}% of your monthly budget. Consider reining in non-essential spend.`,
          icon: "alert-triangle",
        });
      } else if (used >= 80) {
        insights.push({
          id: "budget-global-high",
          kind: "warning",
          title: "Approaching monthly budget",
          detail: `You've used ${Math.round(used)}% of your monthly budget with weeks left. Slow down.`,
          icon: "alert-triangle",
        });
      }
    }
    if (b.scope === "category" && b.categoryId && b.amount > 0) {
      const used = ((thisCats[b.categoryId] ?? 0) / b.amount) * 100;
      if (used >= 100) {
        const cat = CATEGORY_MAP[b.categoryId];
        insights.push({
          id: `budget-cat-${b.categoryId}`,
          kind: "warning",
          title: `${cat.label} budget exceeded`,
          detail: `You've spent ${Math.round(used)}% of the ${cat.label.toLowerCase()} budget this month.`,
          icon: "alert-triangle",
        });
      }
    }
  }

  const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
  const largest = sorted[0];
  if (largest && expenses.length >= 3) {
    const mean = expenses.reduce((s, e) => s + e.amount, 0) / expenses.length;
    if (largest.amount >= mean * 4) {
      insights.push({
        id: "outlier",
        kind: "info",
        title: "Unusually large expense",
        detail: `"${largest.description}" at ${Math.round(largest.amount).toLocaleString()} MAD is notably larger than your average spend.`,
        icon: "activity",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "all-good",
      kind: "positive",
      title: "Spending is on plan",
      detail: "Nothing unusual to report. Your financial controls are working.",
      icon: "check-circle",
    });
  }

  return insights;
}

export function dailySeries(expenses: Expense[], days = 14): { date: string; value: number }[] {
  const series: { date: string; value: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const value = expenses
      .filter((e) => e.date.slice(0, 10) === key)
      .reduce((s, e) => s + e.amount, 0);
    series.push({ date: key, value });
  }
  return series;
}

export function monthlySeries(expenses: Expense[], months = 6): { month: string; value: number }[] {
  const series: { month: string; value: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = expenses
      .filter((e) => e.date.slice(0, 7) === key)
      .reduce((s, e) => s + e.amount, 0);
    series.push({ month: key, value });
  }
  return series;
}

export function categoryBreakdown(
  expenses: Expense[],
  withinMonth?: string,
): { categoryId: CategoryId; value: number }[] {
  const totals: Partial<Record<CategoryId, number>> = {};
  for (const e of expenses) {
    if (withinMonth && e.date.slice(0, 7) !== withinMonth) continue;
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  return Object.entries(totals)
    .map(([id, value]) => ({ categoryId: id as CategoryId, value: value ?? 0 }))
    .sort((a, b) => b.value - a.value);
}
