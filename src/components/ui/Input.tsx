import { TextInput, TextInputProps, StyleSheet, View, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "../themed-text";
import { Spacing } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  rightElement?: React.ReactNode;
}

export function Input({ label, error, containerStyle, inputStyle, rightElement, ...props }: InputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle as any]}>
      {label && (
        <ThemedText style={[{ fontWeight: "600" }, styles.label]}>
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? "#ef4444" : theme.border,
          }
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
            inputStyle as any
          ]}
          placeholderTextColor={theme.textMuted}
          {...props}
        />
        {rightElement && (
          <View style={styles.rightElementContainer}>
            {rightElement}
          </View>
        )}
      </View>
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    fontSize: 16,
  },
  rightElementContainer: {
    paddingRight: Spacing.four,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: Spacing.one,
  }
});
