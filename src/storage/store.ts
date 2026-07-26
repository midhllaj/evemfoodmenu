import AsyncStorage from "@react-native-async-storage/async-storage";
import { seedDishes, seedHeadings, seedTemplates } from "../data/seed";
import { CustomerDetails, Dish, Heading, MenuTemplate, QuotationDraft } from "../types";

const keys = {
  headings: "evam.headings",
  dishes: "evam.dishes",
  templates: "evam.templates",
  customers: "evam.customers",
  draft: "evam.currentDraft",
  pdfHistory: "evam.pdfHistory"
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : fallback;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function seedStore() {
  const headings = await AsyncStorage.getItem(keys.headings);
  if (!headings) {
    await Promise.all([
      writeJson(keys.headings, seedHeadings),
      writeJson(keys.dishes, seedDishes),
      writeJson(keys.templates, seedTemplates)
    ]);
  }
}

export const store = {
  getHeadings: () => readJson<Heading[]>(keys.headings, seedHeadings),
  setHeadings: (value: Heading[]) => writeJson(keys.headings, value),
  getDishes: () => readJson<Dish[]>(keys.dishes, seedDishes),
  setDishes: (value: Dish[]) => writeJson(keys.dishes, value),
  getTemplates: () => readJson<MenuTemplate[]>(keys.templates, seedTemplates),
  setTemplates: (value: MenuTemplate[]) => writeJson(keys.templates, value),
  getCustomers: () => readJson<CustomerDetails[]>(keys.customers, []),
  setCustomers: (value: CustomerDetails[]) => writeJson(keys.customers, value),
  getDraft: () =>
    readJson<QuotationDraft | null>(keys.draft, null),
  setDraft: (value: QuotationDraft) => writeJson(keys.draft, value),
  getPdfHistory: () => readJson<string[]>(keys.pdfHistory, []),
  addPdfHistory: async (uri: string) => {
    const history = await readJson<string[]>(keys.pdfHistory, []);
    await writeJson(keys.pdfHistory, [uri, ...history].slice(0, 20));
  }
};
