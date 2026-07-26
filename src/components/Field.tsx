import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { AppTheme } from "../theme/theme";

type Props = TextInputProps & {
  label: string;
  theme: AppTheme;
};

export function Field({ label, theme, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          },
          style
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15
  }
});
