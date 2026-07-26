import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import { categories } from "../data/seed";
import { AppTheme } from "../theme/theme";
import { Dish, Heading, SelectedDish } from "../types";
import { makeId } from "../utils/id";

type Props = {
  theme: AppTheme;
  headings: Heading[];
  dishes: Dish[];
  selectedDishes: Record<string, SelectedDish>;
  onSelectedChange: (selected: Record<string, SelectedDish>) => void;
  onHeadingsChange: (headings: Heading[]) => void;
  onDishesChange: (dishes: Dish[]) => void;
  onBack: () => void;
  onPreview: () => void;
};

export function BuilderScreen({
  theme,
  headings,
  dishes,
  selectedDishes,
  onSelectedChange,
  onHeadingsChange,
  onDishesChange,
  onBack,
  onPreview
}: Props) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [headingSearch, setHeadingSearch] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sectionAddOpen, setSectionAddOpen] = useState<Record<string, boolean>>({});
  const [sectionDishNames, setSectionDishNames] = useState<Record<string, string>>({});
  const [newHeading, setNewHeading] = useState("");
  const [newDish, setNewDish] = useState({ name: "", category: "Kerala Sadya", headingId: "food-menu", price: "" });

  const sortedHeadings = useMemo(
    () => headings.filter((heading) => heading.visible).sort((a, b) => a.displayOrder - b.displayOrder),
    [headings]
  );

  const filteredDishes = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    return dishes
      .filter((dish) => (query ? dish.name.toLowerCase().includes(query) || dish.category.toLowerCase().includes(query) : true))
      .filter((dish) => (selectedCategories.length ? selectedCategories.includes(dish.category) : true))
      .sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || a.name.localeCompare(b.name));
  }, [dishes, globalSearch, selectedCategories]);

  function toggleDish(dish: Dish) {
    const next = { ...selectedDishes };
    if (next[dish.id]) {
      delete next[dish.id];
    } else {
      next[dish.id] = dish;
    }
    onSelectedChange(next);
  }

  function updateSelectedDish(id: string, patch: Partial<SelectedDish>) {
    if (!selectedDishes[id]) return;
    onSelectedChange({ ...selectedDishes, [id]: { ...selectedDishes[id], ...patch } });
  }

  function addHeading() {
    const name = newHeading.trim();
    if (!name) return;
    const heading: Heading = {
      id: makeId("heading"),
      name,
      displayOrder: headings.length + 1,
      visible: true
    };
    onHeadingsChange([...headings, heading]);
    setNewHeading("");
  }

  function addDish() {
    const name = newDish.name.trim();
    if (!name) return;
    const dish: Dish = {
      id: makeId("dish"),
      name,
      category: newDish.category,
      headingId: newDish.headingId,
      price: newDish.price
    };
    onDishesChange([...dishes, dish]);
    setNewDish((current) => ({ ...current, name: "", price: "" }));
  }

  function addSectionDish(heading: Heading, headingDishes: Dish[]) {
    const name = (sectionDishNames[heading.id] ?? "").trim();
    if (!name) return;
    const dish: Dish = {
      id: makeId("dish"),
      name,
      category: headingDishes[0]?.category ?? "Custom",
      headingId: heading.id
    };
    onDishesChange([...dishes, dish]);
    setSectionDishNames({ ...sectionDishNames, [heading.id]: "" });
    setSectionAddOpen({ ...sectionAddOpen, [heading.id]: false });
  }

  function dishActions(dish: Dish) {
    Alert.alert(dish.name, "Quick dish actions", [
      {
        text: dish.favorite ? "Remove Favorite" : "Mark Favorite",
        onPress: () =>
          onDishesChange(dishes.map((item) => (item.id === dish.id ? { ...item, favorite: !item.favorite } : item)))
      },
      {
        text: "Duplicate",
        onPress: () => onDishesChange([...dishes, { ...dish, id: makeId("dish"), name: `${dish.name} Copy` }])
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDishesChange(dishes.filter((item) => item.id !== dish.id))
      },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  function toggleCategory(category: string) {
    if (category === "Kerala Sadya" && !selectedCategories.includes(category)) {
      const sadyaDishes = dishes.filter((dish) => dish.category === "Kerala Sadya");
      const next = { ...selectedDishes };
      sadyaDishes.forEach((dish) => {
        next[dish.id] = next[dish.id] ?? dish;
      });
      onSelectedChange(next);
    }
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Menu builder</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{Object.keys(selectedDishes).length} dishes selected</Text>
        </View>
        <Pressable onPress={onPreview} style={[styles.previewIcon, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="file-pdf-box" size={24} color={theme.colors.white} />
        </Pressable>
      </View>

      <TextInput
        value={globalSearch}
        onChangeText={setGlobalSearch}
        placeholder="Search chicken, fish, juice, sadya, mandi..."
        placeholderTextColor={theme.colors.muted}
        style={[styles.search, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={selectedCategories.includes(category)}
            theme={theme}
            onPress={() => toggleCategory(category)}
          />
        ))}
      </ScrollView>

      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Heading Management</Text>
        <View style={styles.inline}>
          <TextInput
            value={newHeading}
            onChangeText={setNewHeading}
            placeholder="Add heading"
            placeholderTextColor={theme.colors.muted}
            style={[styles.inlineInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          />
          <Button label="Save" theme={theme} onPress={addHeading} style={styles.smallButton} />
        </View>
        <View style={styles.headingList}>
          {headings.map((heading) => (
            <Pressable
              key={heading.id}
              onPress={() => onHeadingsChange(headings.map((item) => (item.id === heading.id ? { ...item, visible: !item.visible } : item)))}
              style={[styles.headingPill, { borderColor: theme.colors.border, backgroundColor: heading.visible ? theme.colors.accentSoft : "transparent" }]}
            >
              <Text style={[styles.headingPillText, { color: theme.colors.text }]}>{heading.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Add New Dish</Text>
        <Field theme={theme} label="Dish Name" value={newDish.name} onChangeText={(name) => setNewDish({ ...newDish, name })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.slice(0, 14).map((category) => (
            <Chip key={category} label={category} selected={newDish.category === category} theme={theme} onPress={() => setNewDish({ ...newDish, category })} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {sortedHeadings.map((heading) => (
            <Chip key={heading.id} label={heading.name} selected={newDish.headingId === heading.id} theme={theme} onPress={() => setNewDish({ ...newDish, headingId: heading.id })} />
          ))}
        </ScrollView>
        <Field theme={theme} label="Price Optional" value={newDish.price} keyboardType="number-pad" onChangeText={(price) => setNewDish({ ...newDish, price })} />
        <Button label="Save Dish Permanently" theme={theme} onPress={addDish} />
      </View>

      {sortedHeadings.map((heading) => {
        const localQuery = (headingSearch[heading.id] ?? "").toLowerCase();
        const headingDishes = filteredDishes.filter((dish) => dish.headingId === heading.id && (!localQuery || dish.name.toLowerCase().includes(localQuery)));
        if (!headingDishes.length && globalSearch) return null;
        return (
          <View key={heading.id} style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{heading.name}</Text>
            <TextInput
              value={headingSearch[heading.id] ?? ""}
              onChangeText={(value) => setHeadingSearch({ ...headingSearch, [heading.id]: value })}
              placeholder={`Search inside ${heading.name}`}
              placeholderTextColor={theme.colors.muted}
              style={[styles.innerSearch, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />
            {headingDishes.map((dish) => {
              const selected = selectedDishes[dish.id];
              return (
                <Pressable key={dish.id} onLongPress={() => dishActions(dish)} style={styles.dishRow}>
                  <Pressable onPress={() => toggleDish(dish)} style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: selected ? theme.colors.primary : "transparent" }]}>
                    {selected ? <MaterialCommunityIcons name="check" size={18} color={theme.colors.white} /> : null}
                  </Pressable>
                  <View style={styles.dishBody}>
                    <Text style={[styles.dishName, { color: theme.colors.text }]}>
                      {dish.favorite ? "★ " : ""}
                      {dish.name}
                    </Text>
                    <Text style={[styles.dishMeta, { color: theme.colors.muted }]}>{dish.category}</Text>
                    {selected ? (
                      <View style={styles.selectedFields}>
                        <TextInput
                          value={selected.quantity}
                          onChangeText={(quantity) => updateSelectedDish(dish.id, { quantity })}
                          placeholder="Qty"
                          placeholderTextColor={theme.colors.muted}
                          style={[styles.miniInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                        />
                        <TextInput
                          value={selected.remarks}
                          onChangeText={(remarks) => updateSelectedDish(dish.id, { remarks })}
                          placeholder="Remarks"
                          placeholderTextColor={theme.colors.muted}
                          style={[styles.remarksInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                        />
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
            {sectionAddOpen[heading.id] ? (
              <View style={[styles.sectionAddPanel, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                <TextInput
                  value={sectionDishNames[heading.id] ?? ""}
                  onChangeText={(value) => setSectionDishNames({ ...sectionDishNames, [heading.id]: value })}
                  placeholder={`New item in ${heading.name}`}
                  placeholderTextColor={theme.colors.muted}
                  style={[styles.sectionAddInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                />
                <View style={styles.sectionAddActions}>
                  <Button
                    label="Cancel"
                    theme={theme}
                    variant="ghost"
                    onPress={() => setSectionAddOpen({ ...sectionAddOpen, [heading.id]: false })}
                    style={styles.sectionAddButton}
                  />
                  <Button
                    label="Save Item"
                    theme={theme}
                    onPress={() => addSectionDish(heading, headingDishes)}
                    style={styles.sectionAddButton}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setSectionAddOpen({ ...sectionAddOpen, [heading.id]: true })}
                style={({ pressed }) => [
                  styles.addItemButton,
                  { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft, opacity: pressed ? 0.72 : 1 }
                ]}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.text} />
                <Text style={[styles.addItemText, { color: theme.colors.text }]}>Add Item</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <View style={styles.actions}>
        <Button label="Back" theme={theme} variant="ghost" onPress={onBack} style={styles.action} />
        <Button label="Generate PDF" theme={theme} onPress={onPreview} style={styles.action} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 40
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15
  },
  chips: {
    gap: 8,
    paddingRight: 18
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 12
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "900"
  },
  inline: {
    flexDirection: "row",
    gap: 8
  },
  inlineInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  smallButton: {
    minWidth: 86
  },
  headingList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  headingPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  headingPillText: {
    fontWeight: "800",
    fontSize: 12
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 10
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900"
  },
  innerSearch: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12
  },
  dishRow: {
    flexDirection: "row",
    gap: 11,
    paddingVertical: 10
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  dishBody: {
    flex: 1,
    gap: 3
  },
  dishName: {
    fontSize: 15,
    fontWeight: "800"
  },
  dishMeta: {
    fontSize: 12
  },
  addItemButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "900"
  },
  sectionAddPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    marginTop: 4
  },
  sectionAddInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  sectionAddActions: {
    flexDirection: "row",
    gap: 8
  },
  sectionAddButton: {
    flex: 1,
    minHeight: 44
  },
  selectedFields: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  miniInput: {
    width: 72,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10
  },
  remarksInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  action: {
    flex: 1
  }
});
