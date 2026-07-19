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

export default function ExamsScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewExams = hasPermission("EXAMS.VIEW");

  const {
    data: exams = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get("/exams");
      return res.data;
    },
    enabled: canViewExams,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load exams" : null;

  // Calculate aggregate
  const totalObtained = exams.reduce(
    (sum: number, e: any) => sum + (e.obtainedMarks || e.obtained || 0),
    0,
  );
  const totalMax = exams.reduce(
    (sum: number, e: any) => sum + (e.totalMarks || e.max || 100),
    0,
  );
  const aggregate =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "—";

  if (!canViewExams) {
    return (
      <Screen scrollable={false}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view exams.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">Exams & Marks</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Examination Results & Gradebook
        </ThemedText>
      </View>

      {/* Grade Card Summary */}
      <Card style={styles.summaryCard}>
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            {exams.length > 0 ? "Aggregate Percentage" : "No Data"}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.summaryScore}>
            {isLoading ? "..." : `${aggregate}%`}
          </ThemedText>
        </View>
        <Badge label={`${exams.length} Exams`} type="primary" />
      </Card>

      {/* Loading / Error */}
      {isLoading && (
        <ActivityIndicator
          size="large"
          color={theme.text}
          style={{ marginVertical: Spacing.six }}
        />
      )}

      {error && !isLoading && (
        <Card style={{ borderColor: "#ef4444", marginBottom: Spacing.four }}>
          <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
        </Card>
      )}

      {/* Exam List */}
      {!isLoading && (
        <>
          <ThemedText type="smallBold" style={styles.sectionHeader}>
            SUBJECT BREAKDOWN
          </ThemedText>
          <View style={styles.list}>
            {exams.length === 0 && !error && (
              <ThemedText
                themeColor="textSecondary"
                style={{ textAlign: "center", marginTop: Spacing.four }}
              >
                No exam records found.
              </ThemedText>
            )}
            {exams.map((m: any, idx: number) => {
              const obtained = m.obtainedMarks || m.obtained || 0;
              const max = m.totalMarks || m.max || 100;
              const grade = m.grade || "—";

              return (
                <Card key={m._id || idx} style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.subjectName}>
                      {m.subject || m.name || "Subject"}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Score: {obtained} / {max}
                    </ThemedText>
                  </View>
                  <Badge label={grade} type="default" />
                </Card>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  summaryScore: { fontSize: 28, fontWeight: "700", marginTop: 4 },
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  list: { gap: Spacing.three },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectName: { fontSize: 16, fontWeight: "600" },
});
