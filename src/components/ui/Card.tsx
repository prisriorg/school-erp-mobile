import { View, StyleSheet, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

interface CardProps extends ViewProps {
  style?: ViewStyle | ViewStyle[];
}

export function Card({ style, children, ...props }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        style as any
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  }
});
