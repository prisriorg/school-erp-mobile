import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
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
import { Input } from "@/components/ui/Input";
import { useQuery } from "@tanstack/react-query";

export default function TeachersScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewTeachers = hasPermission("TEACHERS.VIEW");

  const {
    data: teachers = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await api.get("/teachers");
      return res.data;
    },
    enabled: canViewTeachers,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load teachers" : null;
  const [search, setSearch] = useState("");

  const filtered = teachers.filter((t: any) => {
    const q = search.toLowerCase();
    const name = `${t.firstName || ""} ${t.lastName || ""}`.toLowerCase();
    const spec = (t.specialization || "").toLowerCase();
    const email = (t.email || "").toLowerCase();
    return name.includes(q) || spec.includes(q) || email.includes(q);
  });

  if (!canViewTeachers) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view teachers.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">Teachers</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Faculty Directory
        </ThemedText>
      </View>

      <Input
        placeholder="Search teacher name, email..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Loading / Error */}
      {isLoading && (
        <ActivityIndicator size="large" color={theme.text} style={{ marginVertical: Spacing.six }} />
      )}

      {error && !isLoading && (
        <Card style={{ borderColor: "#ef4444", marginBottom: Spacing.four }}>
          <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
        </Card>
      )}

      {/* List */}
      {!isLoading && (
        <View style={styles.list}>
          {filtered.length === 0 && !error && (
            <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
              No teachers found.
            </ThemedText>
          )}
          {filtered.map((t: any) => (
            <Card key={t._id || t.id} style={styles.card}>
              <View style={styles.cardTop}>
                <ThemedText style={styles.teacherName}>
                  {t.firstName} {t.lastName}
                </ThemedText>
                <Badge label={t.specialization?.toUpperCase() || "FACULTY"} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {t.email}
              </ThemedText>
              {t.employeeId && (
                <ThemedText type="small" themeColor="textSecondary">
                  Employee ID: {t.employeeId}
                </ThemedText>
              )}
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
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teacherName: { fontSize: 16, fontWeight: "600" },
});
