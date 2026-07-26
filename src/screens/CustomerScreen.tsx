import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { AppTheme } from "../theme/theme";
import { CustomerDetails } from "../types";

type Props = {
  theme: AppTheme;
  customer: CustomerDetails;
  onChange: (customer: CustomerDetails) => void;
  onNext: () => void;
  onBack: () => void;
};

const fields: Array<{ key: keyof CustomerDetails; label: string; keyboard?: "default" | "phone-pad" | "number-pad" }> = [
  { key: "customerName", label: "Customer Name" },
  { key: "phoneNumber", label: "Phone Number", keyboard: "phone-pad" },
  { key: "eventName", label: "Event Name" },
  { key: "eventDate", label: "Event Date" },
  { key: "venue", label: "Venue" },
  { key: "guests", label: "Number of Guests", keyboard: "number-pad" },
  { key: "eventType", label: "Event Type" },
  { key: "notes", label: "Notes" }
];

export function CustomerScreen({ theme, customer, onChange, onNext, onBack }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Customer details</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Everything here appears in the catering proposal.</Text>
      </View>
      {fields.map((field) => (
        <Field
          key={field.key}
          theme={theme}
          label={field.label}
          value={customer[field.key]}
          keyboardType={field.keyboard}
          multiline={field.key === "notes"}
          onChangeText={(value) => onChange({ ...customer, [field.key]: value })}
        />
      ))}
      <View style={styles.actions}>
        <Button label="Back" theme={theme} variant="ghost" onPress={onBack} style={styles.action} />
        <Button label="Continue" theme={theme} onPress={onNext} style={styles.action} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
    paddingBottom: 36
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6
  },
  action: {
    flex: 1
  }
});
