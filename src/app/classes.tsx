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

export default function ClassesScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewClasses = hasPermission("ACADEMICS.CLASSES.VIEW");

  const {
    data: classes = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get("/classes");
      return res.data;
    },
    enabled: canViewClasses,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load classes" : null;

  if (!canViewClasses) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view classes.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Classes</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Classroom & Section Roster
        </ThemedText>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Card style={styles.statBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Total Classes
          </ThemedText>
          <ThemedText type="subtitle" style={styles.statNum}>
            {isLoading ? "..." : classes.length}
          </ThemedText>
        </Card>
        <Card style={styles.statBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Total Students
          </ThemedText>
          <ThemedText type="subtitle" style={styles.statNum}>
            {isLoading
              ? "..."
              : classes.reduce(
                  (sum: number, c: any) =>
                    sum + (c.students?.length || 0),
                  0,
                )}
          </ThemedText>
        </Card>
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

      {/* Class Grid */}
      {!isLoading && (
        <View style={styles.grid}>
          {classes.length === 0 && !error && (
            <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
              No classes found.
            </ThemedText>
          )}
          {classes.map((cls: any) => (
            <Card key={cls._id || cls.id} style={styles.card}>
              <View style={styles.topRow}>
                <ThemedText style={styles.className}>
                  {cls.name}
                  {cls.section ? ` - ${cls.section}` : ""}
                </ThemedText>
                <Badge label={`${cls.students?.length || 0} students`} type="default" />
              </View>
              {cls.teacher && (
                <ThemedText type="small" themeColor="textSecondary">
                  Teacher: {cls.teacher.firstName} {cls.teacher.lastName}
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
  },
  statNum: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  grid: { gap: Spacing.three },
  card: { gap: Spacing.one },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  className: { fontSize: 18, fontWeight: "700" },
});
