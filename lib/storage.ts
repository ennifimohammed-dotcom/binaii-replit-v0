import AsyncStorage from "@react-native-async-storage/async-storage";

import { CategoryId } from "@/constants/categories";

const STORAGE_PREFIX = "buildvault";

export type Project = {
  id: string;
  name: string;
  client?: string;
  location?: string;
  startDate?: string;
  archived?: boolean;
  color?: string;
};

export type Expense = {
  id: string;
  projectId: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  category: CategoryId;
  amount: number; // MAD
  notes?: string;
  imageUri?: string;
  createdAt: string;
};

export type Budget = {
  id: string;
  projectId: string;
  scope: "global" | "category";
  categoryId?: CategoryId;
  amount: number; // monthly MAD
};

export type Settings = {
  activeProjectId: string | null;
  hasOnboarded: boolean;
};

const KEYS = {
  projects: `${STORAGE_PREFIX}:projects`,
  expenses: `${STORAGE_PREFIX}:expenses`,
  budgets: `${STORAGE_PREFIX}:budgets`,
  settings: `${STORAGE_PREFIX}:settings`,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  async getProjects(): Promise<Project[]> {
    return readJson<Project[]>(KEYS.projects, []);
  },
  async setProjects(p: Project[]): Promise<void> {
    return writeJson(KEYS.projects, p);
  },
  async getExpenses(): Promise<Expense[]> {
    return readJson<Expense[]>(KEYS.expenses, []);
  },
  async setExpenses(e: Expense[]): Promise<void> {
    return writeJson(KEYS.expenses, e);
  },
  async getBudgets(): Promise<Budget[]> {
    return readJson<Budget[]>(KEYS.budgets, []);
  },
  async setBudgets(b: Budget[]): Promise<void> {
    return writeJson(KEYS.budgets, b);
  },
  async getSettings(): Promise<Settings> {
    return readJson<Settings>(KEYS.settings, {
      activeProjectId: null,
      hasOnboarded: false,
    });
  },
  async setSettings(s: Settings): Promise<void> {
    return writeJson(KEYS.settings, s);
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
