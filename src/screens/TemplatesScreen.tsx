import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { store } from "../storage/store";
import { AppTheme } from "../theme/theme";
import { Dish, MenuTemplate } from "../types";

type Props = {
  theme: AppTheme;
  dishes: Dish[];
  onApply: (dishIds: string[]) => void;
  onBack: () => void;
};

export function TemplatesScreen({ theme, dishes, onApply, onBack }: Props) {
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);

  useEffect(() => {
    store.getTemplates().then(setTemplates);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Menu templates</Text>
      {templates.map((template) => {
        const names = dishes.filter((dish) => template.dishIds.includes(dish.id)).slice(0, 5).map((dish) => dish.name);
        return (
          <Pressable
            key={template.id}
            onPress={() => onApply(template.dishIds)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.72 : 1 }
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{template.name}</Text>
            <Text style={[styles.cardMeta, { color: theme.colors.muted }]}>{template.dishIds.length} dishes</Text>
            <Text style={[styles.preview, { color: theme.colors.text }]}>{names.join(" • ")}</Text>
          </Pressable>
        );
      })}
      <Button label="Back to Dashboard" theme={theme} onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: "800"
  },
  preview: {
    fontSize: 13,
    lineHeight: 19
  }
});
