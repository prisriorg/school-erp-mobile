import { TextInput, TextInputProps, StyleSheet, View, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "../themed-text";
import { Spacing } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
}

export function Input({ label, error, containerStyle, inputStyle, ...props }: InputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle as any]}>
      {label && (
        <ThemedText style={[{ fontWeight: "600" }, styles.label]}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? "#ef4444" : theme.border,
            color: theme.text,
          },
          inputStyle as any
        ]}
        placeholderTextColor={theme.textMuted}
        {...props}
      />
      {error && (
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  label: {
    marginBottom: Spacing.two,
    fontSize: 14,
  },
  input: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: Spacing.one,
  }
});
