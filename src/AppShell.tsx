import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { seedDishes, seedHeadings } from "./data/seed";
import { BuilderScreen } from "./screens/BuilderScreen";
import { CustomerScreen } from "./screens/CustomerScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DatabaseScreen } from "./screens/DatabaseScreen";
import { PreviewScreen } from "./screens/PreviewScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TemplatesScreen } from "./screens/TemplatesScreen";
import { store } from "./storage/store";
import { AppTheme } from "./theme/theme";
import { CustomerDetails, Dish, Heading, QuotationDraft, ScreenName, SelectedDish } from "./types";

const emptyCustomer: CustomerDetails = {
  customerName: "",
  phoneNumber: "",
  eventName: "",
  eventDate: "",
  venue: "",
  guests: "",
  eventType: "",
  notes: ""
};

type Props = {
  ready: boolean;
  theme: AppTheme;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

export function AppShell({ ready, theme, darkMode, onToggleDarkMode }: Props) {
  const [screen, setScreen] = useState<ScreenName>("dashboard");
  const [headings, setHeadings] = useState<Heading[]>(seedHeadings);
  const [dishes, setDishes] = useState<Dish[]>(seedDishes);
  const [draft, setDraft] = useState<QuotationDraft>({ customer: emptyCustomer, selectedDishes: {} });

  const selected = useMemo<SelectedDish[]>(() => Object.values(draft.selectedDishes), [draft.selectedDishes]);

  const load = useCallback(async () => {
    const [storedHeadings, storedDishes, storedDraft] = await Promise.all([
      store.getHeadings(),
      store.getDishes(),
      store.getDraft()
    ]);
    setHeadings(storedHeadings);
    setDishes(storedDishes);
    if (storedDraft) {
      setDraft(storedDraft);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      load();
    }
  }, [load, ready]);

  useEffect(() => {
    if (ready) {
      store.setDraft(draft);
    }
  }, [draft, ready]);

  async function updateHeadings(next: Heading[]) {
    setHeadings(next);
    await store.setHeadings(next);
  }

  async function updateDishes(next: Dish[]) {
    setDishes(next);
    await store.setDishes(next);
  }

  if (!ready) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={{ color: theme.colors.muted }}>Preparing offline workspace...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {screen === "dashboard" && <DashboardScreen theme={theme} onNavigate={setScreen} selectedCount={selected.length} />}
        {screen === "customer" && (
          <CustomerScreen
            theme={theme}
            customer={draft.customer}
            onChange={(customer) => setDraft((current) => ({ ...current, customer }))}
            onNext={() => setScreen("builder")}
            onBack={() => setScreen("dashboard")}
          />
        )}
        {screen === "builder" && (
          <BuilderScreen
            theme={theme}
            headings={headings}
            dishes={dishes}
            selectedDishes={draft.selectedDishes}
            onSelectedChange={(selectedDishes) => setDraft((current) => ({ ...current, selectedDishes }))}
            onHeadingsChange={updateHeadings}
            onDishesChange={updateDishes}
            onBack={() => setScreen("customer")}
            onPreview={() => setScreen("preview")}
          />
        )}
        {screen === "preview" && (
          <PreviewScreen
            theme={theme}
            customer={draft.customer}
            headings={headings}
            selected={selected}
            onSaveTemplate={async () => {
              const templates = await store.getTemplates();
              const name = draft.customer.eventName || draft.customer.eventType || "Custom Menu";
              await store.setTemplates([
                {
                  id: `template-${Date.now()}`,
                  name,
                  dishIds: selected.map((dish) => dish.id),
                  headingIds: Array.from(new Set(selected.map((dish) => dish.headingId)))
                },
                ...templates
              ]);
            }}
            onBack={() => setScreen("builder")}
          />
        )}
        {screen === "history" && <HistoryScreen theme={theme} onBack={() => setScreen("dashboard")} />}
        {screen === "database" && (
          <DatabaseScreen theme={theme} headings={headings} dishes={dishes} onDishesChange={updateDishes} onBack={() => setScreen("dashboard")} />
        )}
        {screen === "templates" && (
          <TemplatesScreen
            theme={theme}
            dishes={dishes}
            onApply={(dishIds) => {
              const next = dishes
                .filter((dish) => dishIds.includes(dish.id))
                .reduce<Record<string, SelectedDish>>((acc, dish) => {
                  acc[dish.id] = dish;
                  return acc;
                }, {});
              setDraft((current) => ({ ...current, selectedDishes: next }));
              setScreen("builder");
            }}
            onBack={() => setScreen("dashboard")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen theme={theme} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} onBack={() => setScreen("dashboard")} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center"
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  }
});
