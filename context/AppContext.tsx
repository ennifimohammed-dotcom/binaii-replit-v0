import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CategoryId } from "@/constants/categories";
import { newId } from "@/lib/format";
import { buildSeed } from "@/lib/seed";
import {
  Budget,
  Expense,
  Project,
  Settings,
  storage,
} from "@/lib/storage";

type AppContextValue = {
  ready: boolean;
  projects: Project[];
  expenses: Expense[];
  budgets: Budget[];
  activeProjectId: string | null;
  activeProject: Project | null;
  projectExpenses: Expense[];
  projectBudgets: Budget[];

  setActiveProject: (id: string) => Promise<void>;

  addProject: (data: Omit<Project, "id">) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addExpense: (data: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  setGlobalBudget: (amount: number) => Promise<void>;
  setCategoryBudget: (categoryId: CategoryId, amount: number) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;

  resetWithSeed: () => Promise<void>;
  clearAllData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<Settings>({
    activeProjectId: null,
    hasOnboarded: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [p, e, b, s] = await Promise.all([
        storage.getProjects(),
        storage.getExpenses(),
        storage.getBudgets(),
        storage.getSettings(),
      ]);
      if (!mounted) return;

      if (!s.hasOnboarded || p.length === 0) {
        const seed = buildSeed();
        await Promise.all([
          storage.setProjects(seed.projects),
          storage.setExpenses(seed.expenses),
          storage.setBudgets(seed.budgets),
          storage.setSettings({
            activeProjectId: seed.activeProjectId,
            hasOnboarded: true,
          }),
        ]);
        setProjects(seed.projects);
        setExpenses(seed.expenses);
        setBudgets(seed.budgets);
        setSettings({
          activeProjectId: seed.activeProjectId,
          hasOnboarded: true,
        });
      } else {
        setProjects(p);
        setExpenses(e);
        setBudgets(b);
        const activeId =
          s.activeProjectId && p.some((proj) => proj.id === s.activeProjectId)
            ? s.activeProjectId
            : (p[0]?.id ?? null);
        setSettings({ ...s, activeProjectId: activeId });
        if (activeId !== s.activeProjectId) {
          await storage.setSettings({ ...s, activeProjectId: activeId });
        }
      }
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistProjects = useCallback(async (next: Project[]) => {
    setProjects(next);
    await storage.setProjects(next);
  }, []);

  const persistExpenses = useCallback(async (next: Expense[]) => {
    setExpenses(next);
    await storage.setExpenses(next);
  }, []);

  const persistBudgets = useCallback(async (next: Budget[]) => {
    setBudgets(next);
    await storage.setBudgets(next);
  }, []);

  const persistSettings = useCallback(async (next: Settings) => {
    setSettings(next);
    await storage.setSettings(next);
  }, []);

  const setActiveProject = useCallback(
    async (id: string) => {
      await persistSettings({ ...settings, activeProjectId: id });
    },
    [persistSettings, settings],
  );

  const addProject = useCallback(
    async (data: Omit<Project, "id">) => {
      const project: Project = { id: newId(), ...data };
      const next = [...projects, project];
      await persistProjects(next);
      if (!settings.activeProjectId) {
        await persistSettings({ ...settings, activeProjectId: project.id });
      }
      return project;
    },
    [persistProjects, persistSettings, projects, settings],
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<Project>) => {
      const next = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
      await persistProjects(next);
    },
    [persistProjects, projects],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const next = projects.filter((p) => p.id !== id);
      const nextExpenses = expenses.filter((e) => e.projectId !== id);
      const nextBudgets = budgets.filter((b) => b.projectId !== id);
      await Promise.all([
        persistProjects(next),
        persistExpenses(nextExpenses),
        persistBudgets(nextBudgets),
      ]);
      if (settings.activeProjectId === id) {
        await persistSettings({
          ...settings,
          activeProjectId: next[0]?.id ?? null,
        });
      }
    },
    [
      budgets,
      expenses,
      persistBudgets,
      persistExpenses,
      persistProjects,
      persistSettings,
      projects,
      settings,
    ],
  );

  const addExpense = useCallback(
    async (data: Omit<Expense, "id" | "createdAt">) => {
      const expense: Expense = {
        id: newId(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      await persistExpenses([expense, ...expenses]);
      return expense;
    },
    [expenses, persistExpenses],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<Expense>) => {
      const next = expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
      await persistExpenses(next);
    },
    [expenses, persistExpenses],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const next = expenses.filter((e) => e.id !== id);
      await persistExpenses(next);
    },
    [expenses, persistExpenses],
  );

  const setGlobalBudget = useCallback(
    async (amount: number) => {
      const projectId = settings.activeProjectId;
      if (!projectId) return;
      const existing = budgets.find(
        (b) => b.projectId === projectId && b.scope === "global",
      );
      let next: Budget[];
      if (existing) {
        next = budgets.map((b) =>
          b.id === existing.id ? { ...b, amount } : b,
        );
      } else {
        next = [
          ...budgets,
          { id: newId(), projectId, scope: "global", amount },
        ];
      }
      await persistBudgets(next);
    },
    [budgets, persistBudgets, settings.activeProjectId],
  );

  const setCategoryBudget = useCallback(
    async (categoryId: CategoryId, amount: number) => {
      const projectId = settings.activeProjectId;
      if (!projectId) return;
      const existing = budgets.find(
        (b) =>
          b.projectId === projectId &&
          b.scope === "category" &&
          b.categoryId === categoryId,
      );
      let next: Budget[];
      if (amount <= 0) {
        next = budgets.filter((b) => b.id !== existing?.id);
      } else if (existing) {
        next = budgets.map((b) =>
          b.id === existing.id ? { ...b, amount } : b,
        );
      } else {
        next = [
          ...budgets,
          {
            id: newId(),
            projectId,
            scope: "category",
            categoryId,
            amount,
          },
        ];
      }
      await persistBudgets(next);
    },
    [budgets, persistBudgets, settings.activeProjectId],
  );

  const removeBudget = useCallback(
    async (id: string) => {
      await persistBudgets(budgets.filter((b) => b.id !== id));
    },
    [budgets, persistBudgets],
  );

  const resetWithSeed = useCallback(async () => {
    const seed = buildSeed();
    await Promise.all([
      storage.setProjects(seed.projects),
      storage.setExpenses(seed.expenses),
      storage.setBudgets(seed.budgets),
      storage.setSettings({
        activeProjectId: seed.activeProjectId,
        hasOnboarded: true,
      }),
    ]);
    setProjects(seed.projects);
    setExpenses(seed.expenses);
    setBudgets(seed.budgets);
    setSettings({
      activeProjectId: seed.activeProjectId,
      hasOnboarded: true,
    });
  }, []);

  const clearAllData = useCallback(async () => {
    await storage.clearAll();
    setProjects([]);
    setExpenses([]);
    setBudgets([]);
    setSettings({ activeProjectId: null, hasOnboarded: true });
    await storage.setSettings({ activeProjectId: null, hasOnboarded: true });
  }, []);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === settings.activeProjectId) ?? null,
    [projects, settings.activeProjectId],
  );

  const projectExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.projectId === settings.activeProjectId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, settings.activeProjectId],
  );

  const projectBudgets = useMemo(
    () => budgets.filter((b) => b.projectId === settings.activeProjectId),
    [budgets, settings.activeProjectId],
  );

  const value: AppContextValue = {
    ready,
    projects,
    expenses,
    budgets,
    activeProjectId: settings.activeProjectId,
    activeProject,
    projectExpenses,
    projectBudgets,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
    addExpense,
    updateExpense,
    deleteExpense,
    setGlobalBudget,
    setCategoryBudget,
    removeBudget,
    resetWithSeed,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
