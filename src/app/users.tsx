import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";

export default function UsersScreen() {
  const theme = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    }
  }, []);

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false));
  }, [fetchUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <ThemedText type="title">System Users</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Credentials & Role Assignments
            </ThemedText>
          </View>

          {/* Loading / Error */}
          {isLoading && (
            <ActivityIndicator
              size="large"
              color={theme.text}
              style={{ marginVertical: Spacing.six }}
            />
          )}

          {error && !isLoading && (
            <ThemedView
              type="backgroundElement"
              style={{
                padding: Spacing.four,
                borderRadius: Spacing.two,
                marginBottom: Spacing.four,
              }}
            >
              <ThemedText themeColor="textSecondary">{error}</ThemedText>
            </ThemedView>
          )}

          {/* User List */}
          {!isLoading && (
            <View style={styles.list}>
              {users.length === 0 && !error && (
                <ThemedText
                  themeColor="textSecondary"
                  style={{ textAlign: "center", marginTop: Spacing.four }}
                >
                  No users found.
                </ThemedText>
              )}
              {users.map((u, idx) => (
                <ThemedView
                  key={u._id || u.id || idx}
                  type="backgroundElement"
                  style={styles.card}
                >
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.email}>{u.email}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        User ID: {u._id || u.id}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: theme.primaryForeground,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {(u.role || "user").toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                </ThemedView>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  safeArea: { flex: 1, width: "100%", maxWidth: MaxContentWidth },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: { marginBottom: Spacing.four },
  list: { gap: Spacing.three },
  card: { padding: Spacing.four, borderRadius: Spacing.three },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  email: { fontSize: 16, fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
