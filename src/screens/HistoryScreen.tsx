import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "../components/Button";
import { store } from "../storage/store";
import { AppTheme } from "../theme/theme";

type Props = {
  theme: AppTheme;
  onBack: () => void;
};

export function HistoryScreen({ theme, onBack }: Props) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    store.getPdfHistory().then(setHistory);
  }, []);

  async function share(uri: string) {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing unavailable", "This device does not expose a share sheet right now.");
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share saved Evam quotation"
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>PDF history</Text>
      {history.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.muted }]}>Generated quotation PDFs will appear here after sharing.</Text>
      ) : null}
      {history.map((uri, index) => (
        <Pressable
          key={`${uri}-${index}`}
          onPress={() => share(uri)}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.72 : 1 }
          ]}
        >
          <Text style={[styles.name, { color: theme.colors.text }]}>Quotation PDF {history.length - index}</Text>
          <Text numberOfLines={1} style={[styles.uri, { color: theme.colors.muted }]}>{uri}</Text>
        </Pressable>
      ))}
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
  empty: {
    fontSize: 14,
    lineHeight: 21
  },
  row: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6
  },
  name: {
    fontSize: 16,
    fontWeight: "900"
  },
  uri: {
    fontSize: 12
  }
});
