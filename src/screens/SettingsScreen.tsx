import { Switch, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { AppTheme } from "../theme/theme";

type Props = {
  theme: AppTheme;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBack: () => void;
};

export function SettingsScreen({ theme, darkMode, onToggleDarkMode, onBack }: Props) {
  return (
    <View style={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.label, { color: theme.colors.text }]}>Dark Mode</Text>
          <Text style={[styles.help, { color: theme.colors.muted }]}>Useful while preparing late-night event quotes.</Text>
        </View>
        <Switch value={darkMode} onValueChange={onToggleDarkMode} />
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Brand palette</Text>
        <Text style={[styles.help, { color: theme.colors.muted }]}>Deep green, warm gold, and ivory from the bill pad template.</Text>
      </View>
      <Button label="Back to Dashboard" theme={theme} onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 18,
    gap: 14
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  row: {
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 4
  },
  label: {
    fontSize: 16,
    fontWeight: "900"
  },
  help: {
    fontSize: 13,
    lineHeight: 19
  }
});
