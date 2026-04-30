import { CategoryId } from "@/constants/categories";
import { Budget, Expense, Project } from "@/lib/storage";
import { newId } from "@/lib/format";

type RawExpense = {
  date: string;
  desc: string;
  cat: CategoryId;
  amount: number;
};

const ENNIFI_2025: RawExpense[] = [
  { date: "2025-07-07", desc: "تجديد رخصة", cat: "permits", amount: 1200 },
  { date: "2025-07-15", desc: "تسبيق دروغري", cat: "materials", amount: 25000 },
  { date: "2025-07-16", desc: "رملة + كياس", cat: "materials", amount: 5800 },
  { date: "2025-07-28", desc: "دفعة 1 للمعلم", cat: "labor", amount: 5000 },
  { date: "2025-07-31", desc: "حديد", cat: "materials", amount: 880 },
  { date: "2025-07-31", desc: "تسبيق سدور", cat: "materials", amount: 300 },
  { date: "2025-07-31", desc: "دفعة للمعلم لحديد", cat: "materials", amount: 300 },
  { date: "2025-08-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2025-08-04", desc: "دفعة 2 للمعلم", cat: "labor", amount: 5000 },
  { date: "2025-08-11", desc: "دفعة 3 للمعلم", cat: "labor", amount: 5500 },
  { date: "2025-08-18", desc: "دفعة 4 للمعلم", cat: "labor", amount: 3650 },
  { date: "2025-09-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2025-09-08", desc: "حداد", cat: "materials", amount: 800 },
  { date: "2025-09-09", desc: "حديد", cat: "materials", amount: 2200 },
  { date: "2025-09-17", desc: "كود بواتي (الماء) 41 وحدة", cat: "utilities", amount: 1500 },
  { date: "2025-09-17", desc: "تسبيق حداد", cat: "materials", amount: 500 },
  { date: "2025-09-18", desc: "كونكورد", cat: "utilities", amount: 2900 },
  { date: "2025-09-22", desc: "تريسيان", cat: "utilities", amount: 9500 },
  { date: "2025-09-29", desc: "تسبيق حداد", cat: "materials", amount: 200 },
  { date: "2025-10-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2025-10-16", desc: "رملة", cat: "materials", amount: 4300 },
  { date: "2025-10-17", desc: "سيمة", cat: "materials", amount: 2400 },
  { date: "2025-10-18", desc: "دفعة 1 للمعلم (المرتوب)", cat: "labor", amount: 2500 },
  { date: "2025-10-18", desc: "خشب 3000FC", cat: "materials", amount: 3000 },
  { date: "2025-10-22", desc: "حداد", cat: "materials", amount: 400 },
  { date: "2025-10-22", desc: "سيمة", cat: "materials", amount: 1654 },
  { date: "2025-10-25", desc: "حديد", cat: "materials", amount: 4100 },
  { date: "2025-10-25", desc: "حداد 1", cat: "materials", amount: 300 },
  { date: "2025-10-27", desc: "دفعة 2 للمعلم (المرتوب)", cat: "labor", amount: 7000 },
  { date: "2025-10-27", desc: "سيمة", cat: "materials", amount: 1654 },
  { date: "2025-10-31", desc: "سيمة", cat: "materials", amount: 2000 },
  { date: "2025-11-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2025-11-03", desc: "دفعة 3 للمعلم (المرتوب)", cat: "labor", amount: 9000 },
  { date: "2025-11-05", desc: "حداد 2", cat: "materials", amount: 500 },
  { date: "2025-11-07", desc: "سيمة", cat: "materials", amount: 1600 },
  { date: "2025-11-08", desc: "رملة", cat: "materials", amount: 2800 },
  { date: "2025-11-10", desc: "دفعة 4 للمعلم (المرتوب)", cat: "labor", amount: 4000 },
  { date: "2025-11-16", desc: "سيمة", cat: "materials", amount: 2500 },
  { date: "2025-11-17", desc: "دفعة 5 للمعلم (المرتوب)", cat: "labor", amount: 4000 },
  { date: "2025-11-17", desc: "دفعة 6 للمعلم (المرتوب)", cat: "labor", amount: 5000 },
  { date: "2025-11-18", desc: "حداد", cat: "materials", amount: 200 },
  { date: "2025-11-26", desc: "تسبيق الزلايجي السطح", cat: "materials", amount: 1500 },
  { date: "2025-11-26", desc: "سيمة", cat: "materials", amount: 2750 },
  { date: "2025-11-26", desc: "زليج السطح 1", cat: "materials", amount: 9700 },
  { date: "2025-11-29", desc: "سيمة", cat: "materials", amount: 500 },
  { date: "2025-11-29", desc: "زليج السطح 2", cat: "materials", amount: 400 },
  { date: "2025-11-29", desc: "حداد", cat: "materials", amount: 1000 },
  { date: "2025-11-30", desc: "دفعة الزلايجي السطح", cat: "materials", amount: 2000 },
  { date: "2025-12-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2025-12-04", desc: "دفعة الزلايجي السطح", cat: "materials", amount: 3500 },
  { date: "2025-12-31", desc: "كابل كهربائي للجبس", cat: "materials", amount: 200 },
  { date: "2026-01-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2026-01-05", desc: "جباس", cat: "materials", amount: 3000 },
  { date: "2026-01-10", desc: "كابل كهربائي للجبس", cat: "materials", amount: 400 },
  { date: "2026-01-10", desc: "حداد", cat: "materials", amount: 1600 },
  { date: "2026-01-12", desc: "جباس", cat: "materials", amount: 5000 },
  { date: "2026-01-19", desc: "جباس", cat: "materials", amount: 5000 },
  { date: "2026-01-25", desc: "جباس", cat: "materials", amount: 5000 },
  { date: "2026-02-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2026-02-02", desc: "جباس", cat: "materials", amount: 4000 },
  { date: "2026-02-09", desc: "جباس", cat: "materials", amount: 3500 },
  { date: "2026-02-23", desc: "دفعة 7 للمعلم (المرتوب)", cat: "labor", amount: 3000 },
  { date: "2026-03-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
  { date: "2026-04-01", desc: "دفعة دروغري", cat: "materials", amount: 4000 },
];

export function buildSeed(): {
  projects: Project[];
  expenses: Expense[];
  budgets: Budget[];
  activeProjectId: string;
} {
  const ennifiId = newId();
  const now = new Date().toISOString();

  const projects: Project[] = [
    {
      id: ennifiId,
      name: "ENNIFI 2025",
      client: "ENNIFI",
      location: "Maroc",
      startDate: "2025-07-07",
      color: "#C8A65A",
    },
  ];

  const expenses: Expense[] = ENNIFI_2025.map((s) => ({
    id: newId(),
    projectId: ennifiId,
    date: s.date,
    description: s.desc,
    category: s.cat,
    amount: s.amount,
    createdAt: now,
  }));

  const total = ENNIFI_2025.reduce((acc, s) => acc + s.amount, 0);
  const round = (n: number) => Math.ceil(n / 1000) * 1000;
  const byCat = ENNIFI_2025.reduce<Record<string, number>>((acc, s) => {
    acc[s.cat] = (acc[s.cat] ?? 0) + s.amount;
    return acc;
  }, {});

  const budgets: Budget[] = [
    {
      id: newId(),
      projectId: ennifiId,
      scope: "global",
      amount: round(total * 1.25),
    },
    ...(Object.entries(byCat) as [CategoryId, number][]).map(([cat, sum]) => ({
      id: newId(),
      projectId: ennifiId,
      scope: "category" as const,
      categoryId: cat,
      amount: round(sum * 1.3),
    })),
  ];

  return {
    projects,
    expenses,
    budgets,
    activeProjectId: ennifiId,
  };
}
