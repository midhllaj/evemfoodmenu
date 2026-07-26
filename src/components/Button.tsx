import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { AppTheme } from "../theme/theme";

type Props = {
  label: string;
  theme: AppTheme;
  onPress: () => void;
  icon?: ReactNode;
  variant?: "primary" | "soft" | "ghost";
  style?: ViewStyle;
};

export function Button({ label, theme, onPress, icon, variant = "primary", style }: Props) {
  const colors = theme.colors;
  const backgroundColor =
    variant === "primary" ? colors.primary : variant === "soft" ? colors.accentSoft : "transparent";
  const color = variant === "primary" ? colors.white : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: variant === "ghost" ? colors.border : backgroundColor, opacity: pressed ? 0.72 : 1 },
        style
      ]}
    >
      {icon}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  label: {
    fontSize: 15,
    fontWeight: "800"
  }
});
