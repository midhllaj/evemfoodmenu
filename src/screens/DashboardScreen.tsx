import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { AppTheme } from "../theme/theme";
import { ScreenName } from "../types";

const cards: Array<{ label: string; screen: ScreenName; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { label: "New Menu", screen: "customer", icon: "plus-box" },
  { label: "Saved Menus", screen: "preview", icon: "content-save" },
  { label: "Customers", screen: "customer", icon: "account-group" },
  { label: "Templates", screen: "templates", icon: "file-star" },
  { label: "PDF History", screen: "history", icon: "file-pdf-box" },
  { label: "Food Database", screen: "database", icon: "silverware-fork-knife" },
  { label: "Settings", screen: "settings", icon: "cog" }
];

type Props = {
  theme: AppTheme;
  selectedCount: number;
  onNavigate: (screen: ScreenName) => void;
};

export function DashboardScreen({ theme, selectedCount, onNavigate }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: theme.colors.accent }]}>Evam Event Planners</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Catering quotations in minutes</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
          Build branded menus, save templates, and share premium PDFs from your phone.
        </Text>
      </View>
      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable
            key={card.label}
            onPress={() => onNavigate(card.screen)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.72 : 1 }
            ]}
          >
            <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
              <MaterialCommunityIcons name={card.icon} size={26} color={theme.colors.primary} />
            </View>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>{card.label}</Text>
            {card.label === "New Menu" && selectedCount > 0 ? (
              <Text style={[styles.meta, { color: theme.colors.muted }]}>{selectedCount} selected</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 18
  },
  hero: {
    paddingTop: 8,
    gap: 8
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    width: "48%",
    minHeight: 132,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between"
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  cardText: {
    fontSize: 17,
    fontWeight: "900"
  },
  meta: {
    fontSize: 12,
    fontWeight: "700"
  }
});
