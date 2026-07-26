import { Pressable, StyleSheet, Text } from "react-native";
import { AppTheme } from "../theme/theme";

type Props = {
  label: string;
  selected?: boolean;
  theme: AppTheme;
  onPress: () => void;
};

export function Chip({ label, selected, theme, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: pressed ? 0.75 : 1
        }
      ]}
    >
      <Text style={[styles.text, { color: selected ? theme.colors.white : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: 13,
    fontWeight: "700"
  }
});
