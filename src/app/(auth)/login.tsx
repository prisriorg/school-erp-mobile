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
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <Screen>
      <View style={styles.content}>
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
            <View style={[styles.errorBox, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          )}

          {/* Email Input */}
          <Input
            label="Email Address"
            placeholder="you@school.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Submit Button */}
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.text} style={styles.loader} />
          ) : (
            <View style={{ marginTop: 16 }}>
              <Button title="Sign In" onPress={handleLogin} />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
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
    gap: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
  },
  loader: {
    marginVertical: 24,
  },
});
