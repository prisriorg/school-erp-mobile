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

export default function ExamsScreen() {
  const theme = useTheme();

  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load exams");
    }
  }, []);

  useEffect(() => {
    fetchExams().finally(() => setIsLoading(false));
  }, [fetchExams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExams();
    setRefreshing(false);
  };

  // Calculate aggregate
  const totalObtained = exams.reduce(
    (sum, e) => sum + (e.obtainedMarks || e.obtained || 0),
    0,
  );
  const totalMax = exams.reduce(
    (sum, e) => sum + (e.totalMarks || e.max || 100),
    0,
  );
  const aggregate =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "—";

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
            <ThemedText type="title">Exams & Marks</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Examination Results & Gradebook
            </ThemedText>
          </View>

          {/* Grade Card Summary */}
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                {exams.length > 0 ? "Aggregate Percentage" : "No Data"}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.summaryScore}>
                {isLoading ? "..." : `${aggregate}%`}
              </ThemedText>
            </View>
            <View
              style={[styles.badge, { backgroundColor: theme.primary }]}
            >
              <ThemedText
                style={{ color: theme.primaryForeground, fontWeight: "700" }}
              >
                {exams.length} Exams
              </ThemedText>
            </View>
          </ThemedView>

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
                {exams.map((m, idx) => {
                  const obtained = m.obtainedMarks || m.obtained || 0;
                  const max = m.totalMarks || m.max || 100;
                  const grade = m.grade || "—";

                  return (
                    <ThemedView
                      key={m._id || idx}
                      type="backgroundElement"
                      style={styles.card}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.subjectName}>
                          {m.subject || m.name || "Subject"}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          Score: {obtained} / {max}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.gradeBadge,
                          { backgroundColor: theme.backgroundSelected },
                        ]}
                      >
                        <ThemedText
                          type="code"
                          style={{ fontWeight: "700" }}
                        >
                          {grade}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  );
                })}
              </View>
            </>
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
  summaryCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  summaryScore: { fontSize: 28, fontWeight: "700", marginTop: 4 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  list: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectName: { fontSize: 16, fontWeight: "600" },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});
