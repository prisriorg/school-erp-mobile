import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    try {
      await login(email, password);
      router.replace("/");
    } catch (error: any) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.brandTitle}>
            School ERP
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Sign in to your portal
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          {/* Error Message */}
          {errorMessage && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          )}

          {/* Email Input */}
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.label}
          >
            Email Address
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@school.com"
            placeholderTextColor={theme.textSecondary}
          />

          {/* Password Input */}
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.label}
          >
            Password
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={theme.textSecondary}
          />

          {/* Submit Button */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.text}
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
            >
              <ThemedText
                style={{ color: theme.primaryForeground, fontWeight: "700" }}
              >
                Sign In
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 40,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginTop: 4,
    opacity: 0.7,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
  },
  label: {
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  loader: {
    marginVertical: 24,
  },
});
