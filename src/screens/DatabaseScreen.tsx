import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { categories } from "../data/seed";
import { AppTheme } from "../theme/theme";
import { Dish, Heading } from "../types";

type Props = {
  theme: AppTheme;
  headings: Heading[];
  dishes: Dish[];
  onDishesChange: (dishes: Dish[]) => void;
  onBack: () => void;
};

export function DatabaseScreen({ theme, headings, dishes, onDishesChange, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      dishes
        .filter((dish) => (category ? dish.category === category : true))
        .filter((dish) => dish.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [category, dishes, query]
  );

  function editDish(dish: Dish) {
    Alert.alert(dish.name, "Database actions", [
      {
        text: dish.favorite ? "Remove Favorite" : "Mark Favorite",
        onPress: () => onDishesChange(dishes.map((item) => (item.id === dish.id ? { ...item, favorite: !item.favorite } : item)))
      },
      {
        text: "Move Heading",
        onPress: () => {
          const currentIndex = headings.findIndex((heading) => heading.id === dish.headingId);
          const nextHeading = headings[(currentIndex + 1) % headings.length];
          onDishesChange(dishes.map((item) => (item.id === dish.id ? { ...item, headingId: nextHeading.id } : item)));
        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDishesChange(dishes.filter((item) => item.id !== dish.id))
      },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: theme.colors.text }]}>Food database</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search saved dishes"
        placeholderTextColor={theme.colors.muted}
        style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" theme={theme} selected={!category} onPress={() => setCategory(null)} />
        {categories.map((item) => (
          <Chip key={item} label={item} theme={theme} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </ScrollView>
      <View style={styles.list}>
        {filtered.map((dish) => (
          <Pressable
            key={dish.id}
            onLongPress={() => editDish(dish)}
            style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <View>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {dish.favorite ? "★ " : ""}
                {dish.name}
              </Text>
              <Text style={[styles.meta, { color: theme.colors.muted }]}>{dish.category}</Text>
            </View>
            <Text style={[styles.meta, { color: theme.colors.muted }]}>{headings.find((heading) => heading.id === dish.headingId)?.name}</Text>
          </Pressable>
        ))}
      </View>
      <Button label="Back to Dashboard" theme={theme} onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 12,
    paddingBottom: 36
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14
  },
  chips: {
    gap: 8,
    paddingRight: 18
  },
  list: {
    gap: 8
  },
  row: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  name: {
    fontSize: 15,
    fontWeight: "900"
  },
  meta: {
    fontSize: 12
  }
});
