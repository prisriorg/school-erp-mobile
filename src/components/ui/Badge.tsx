import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "../themed-text";
import { Spacing } from "@/constants/theme";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "danger" | "warning" | "primary" | string;
  type?: "default" | "success" | "danger" | "warning" | "primary" | string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  icon?: React.ReactNode;
}

export function Badge({ label, variant, type, style, textStyle, icon }: BadgeProps) {
  const theme = useTheme();
  const effectiveVariant = type || variant || "default";

  const getStyles = () => {
    switch (effectiveVariant) {
      case "success":
        return {
          bg: "#10b98120", // emerald-500 with 20% opacity
          text: "#10b981", // emerald-500
        };
      case "danger":
        return {
          bg: "#ef444420", // red-500 with 20% opacity
          text: "#ef4444", // red-500
        };
      case "warning":
        return {
          bg: "#f59e0b20", // amber-500 with 20% opacity
          text: "#f59e0b", // amber-500
        };
      case "primary":
        return {
          bg: theme.primary,
          text: theme.primaryForeground,
        };
      case "default":
      default:
        return {
          bg: theme.backgroundSelected,
          text: theme.text,
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <View style={[
      styles.container, 
      { backgroundColor: currentStyles.bg },
      style as any
    ]}>
      {icon}
      <ThemedText
        type="smallBold"
        style={[
          { color: currentStyles.text },
          icon ? { marginLeft: Spacing.one } : null,
          textStyle as any
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  }
});
