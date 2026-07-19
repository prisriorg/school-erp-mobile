import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "../themed-text";
import { Spacing } from "@/constants/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  isLoading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  icon?: React.ReactNode;
}

export function Button({ 
  title, 
  variant = "primary", 
  isLoading, 
  style, 
  textStyle, 
  icon,
  ...props 
}: ButtonProps) {
  const theme = useTheme();
  
  const getStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          bg: theme.backgroundSelected,
          text: theme.text,
          border: theme.backgroundSelected
        };
      case "outline":
        return {
          bg: "transparent",
          text: theme.text,
          border: theme.border
        };
      case "ghost":
        return {
          bg: "transparent",
          text: theme.text,
          border: "transparent"
        };
      case "destructive":
        return {
          bg: "#ef4444",
          text: "#ffffff",
          border: "#ef4444"
        };
      case "primary":
      default:
        return {
          bg: theme.primary,
          text: theme.primaryForeground,
          border: theme.primary
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: currentStyles.bg,
          borderColor: currentStyles.border,
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: props.disabled || isLoading ? 0.6 : 1,
        },
        style as any
      ]}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={currentStyles.text} />
      ) : (
        <>
          {icon}
          <ThemedText
            style={[
              { color: currentStyles.text, textAlign: "center", fontWeight: "600" },
              icon ? { marginLeft: Spacing.two } : null,
              textStyle as any
            ]}
          >
            {title}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  }
});
