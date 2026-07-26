import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { store } from "../storage/store";
import { AppTheme } from "../theme/theme";
import { CustomerDetails, Heading, SelectedDish } from "../types";
import { createAndSharePdf, downloadQuotationPdf } from "../utils/pdf";
import { LOGO_BASE64 } from "../utils/logo";

type Props = {
  theme: AppTheme;
  customer: CustomerDetails;
  headings: Heading[];
  selected: SelectedDish[];
  onSaveTemplate: () => Promise<void>;
  onBack: () => void;
};

export function PreviewScreen({ theme, customer, headings, selected, onSaveTemplate, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const groups = useMemo(
    () =>
      headings
        .filter((heading) => heading.visible)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((heading) => ({ heading, dishes: selected.filter((dish) => dish.headingId === heading.id) }))
        .filter((group) => group.dishes.length > 0),
    [headings, selected]
  );

  async function sharePdf() {
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select at least one dish before generating the quotation PDF.");
      return;
    }
    setBusy(true);
    try {
      const uri = await createAndSharePdf(customer, headings, selected);
      await store.addPdfHistory(uri);
      Alert.alert("PDF ready", "The catering proposal PDF has been created.");
    } catch (error) {
      Alert.alert("PDF failed", error instanceof Error ? error.message : "Could not generate the quotation.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select at least one dish before downloading the quotation PDF.");
      return;
    }
    setBusy(true);
    try {
      await downloadQuotationPdf(customer, headings, selected);
      // On web the PDF is downloaded directly via an anchor click — no alert needed.
      // On mobile expo-print saves the file.
    } catch (error) {
      Alert.alert("Download failed", error instanceof Error ? error.message : "Could not prepare the quotation PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function saveTemplate() {
    if (!selected.length) {
      Alert.alert("No dishes selected", "Select dishes before saving a reusable template.");
      return;
    }
    await onSaveTemplate();
    Alert.alert("Template saved", "This selected menu can now be loaded from Templates.");
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Proposal preview</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>A4 luxury PDF using the Evam green and gold palette.</Text>
        </View>
        <MaterialCommunityIcons name="crown-outline" size={28} color={theme.colors.accent} />
      </View>

      <View style={[styles.proposal, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={[styles.proposalHeader, { borderBottomColor: theme.colors.primary }]}>
          <Image
            source={{ uri: LOGO_BASE64 }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.details, { backgroundColor: theme.colors.background, borderLeftColor: theme.colors.accent }]}>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Customer: {customer.customerName || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Event: {customer.eventName || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Date: {customer.eventDate || "-"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.text }]}>Guests: {customer.guests || "-"}</Text>
        </View>

        {groups.map((group) => (
          <View key={group.heading.id} style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>{group.heading.name}</Text>
            {group.dishes.map((dish) => (
              <Text key={dish.id} style={[styles.item, { color: theme.colors.text }]}>• {dish.name}</Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Back" theme={theme} variant="ghost" onPress={onBack} style={styles.action} />
        <Button label={busy ? "Generating..." : "Share PDF"} theme={theme} onPress={sharePdf} style={styles.action} />
      </View>
      <Button label={busy ? "Preparing..." : "Download PDF"} theme={theme} onPress={downloadPdf} />
      <Button label="Save Template" theme={theme} variant="soft" onPress={saveTemplate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 36
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
    marginTop: 3,
    fontSize: 14
  },
  proposal: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    gap: 16
  },
  proposalHeader: {
    borderBottomWidth: 3,
    paddingBottom: 14,
    alignItems: "center"
  },
  logoImage: {
    width: 180,
    height: 70,
    alignSelf: "center"
  },
  brand: {
    fontSize: 20,
    fontWeight: "900"
  },
  brandMeta: {
    marginTop: 2,
    fontSize: 12
  },
  gold: {
    fontWeight: "900"
  },
  details: {
    borderLeftWidth: 5,
    padding: 12,
    gap: 4
  },
  detailText: {
    fontSize: 13,
    fontWeight: "700"
  },
  group: {
    gap: 6
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "900",
    borderBottomWidth: 1,
    paddingBottom: 6
  },
  item: {
    fontSize: 14,
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  action: {
    flex: 1
  }
});
