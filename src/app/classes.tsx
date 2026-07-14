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
import { usePermission } from "@/hooks/usePermission";
import { api } from "@/lib/api";

export default function ClassesScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewClasses = hasPermission("ACADEMICS.CLASSES.VIEW");

  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get("/classes");
      setClasses(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load classes");
    }
  }, []);

  useEffect(() => {
    fetchClasses().finally(() => setIsLoading(false));
  }, [fetchClasses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  if (!canViewClasses) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four }}>
          <ThemedText style={{ color: "red", textAlign: "center" }}>
            Access Denied. You do not have permission to view classes.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

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
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title">Classes</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Classroom & Section Roster
            </ThemedText>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsRow}>
            <ThemedView type="backgroundElement" style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">
                Total Classes
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statNum}>
                {isLoading ? "..." : classes.length}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statBox}>
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
            </ThemedView>
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

          {/* Class Grid */}
          {!isLoading && (
            <View style={styles.grid}>
              {classes.length === 0 && !error && (
                <ThemedText
                  themeColor="textSecondary"
                  style={{ textAlign: "center", marginTop: Spacing.four }}
                >
                  No classes found.
                </ThemedText>
              )}
              {classes.map((cls) => (
                <ThemedView
                  key={cls._id || cls.id}
                  type="backgroundElement"
                  style={styles.card}
                >
                  <View style={styles.topRow}>
                    <ThemedText style={styles.className}>
                      {cls.name}
                      {cls.section ? ` - ${cls.section}` : ""}
                    </ThemedText>
                    <View
                      style={[
                        styles.roomBadge,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    >
                      <ThemedText type="code" style={{ fontSize: 11 }}>
                        {cls.students?.length || 0} students
                      </ThemedText>
                    </View>
                  </View>
                  {cls.teacher && (
                    <ThemedText type="small" themeColor="textSecondary">
                      Teacher: {cls.teacher.firstName} {cls.teacher.lastName}
                    </ThemedText>
                  )}
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  statNum: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  grid: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  className: { fontSize: 18, fontWeight: "700" },
  roomBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
});
