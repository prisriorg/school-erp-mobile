import { useState } from "react";
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
import { usePermission } from "@/hooks/usePermission";
import { api } from "@/lib/api";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useQuery } from "@tanstack/react-query";

export default function UsersScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewUsers = hasPermission("USERS.VIEW");

  const {
    data: users = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
    enabled: canViewUsers,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load users" : null;

  if (!canViewUsers) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view system users.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">System Users</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Credentials & Role Assignments
        </ThemedText>
      </View>

      {/* Loading / Error */}
      {isLoading && (
        <ActivityIndicator size="large" color={theme.text} style={{ marginVertical: Spacing.six }} />
      )}

      {error && !isLoading && (
        <Card style={{ borderColor: "#ef4444", marginBottom: Spacing.four }}>
          <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
        </Card>
      )}

      {/* User List */}
      {!isLoading && (
        <View style={styles.list}>
          {users.length === 0 && !error && (
            <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
              No users found.
            </ThemedText>
          )}
          {users.map((u: any, idx: number) => (
            <Card key={u._id || u.id || idx} style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.email}>{u.email}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    User ID: {u._id || u.id}
                  </ThemedText>
                </View>
                <Badge label={(u.role || "user").toUpperCase()} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  list: { gap: Spacing.three },
  card: { gap: Spacing.one },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  email: { fontSize: 16, fontWeight: "600" },
});
