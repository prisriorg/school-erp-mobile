import { useState, useEffect, useCallback } from "react";
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

export default function TeachersScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewTeachers = hasPermission("TEACHERS.VIEW");

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load teachers");
    }
  }, []);

  useEffect(() => {
    fetchTeachers().finally(() => setIsLoading(false));
  }, [fetchTeachers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const name = `${t.firstName || ""} ${t.lastName || ""}`.toLowerCase();
    const spec = (t.specialization || "").toLowerCase();
    const email = (t.email || "").toLowerCase();
    return name.includes(q) || spec.includes(q) || email.includes(q);
  });

  if (!canViewTeachers) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four }}>
          <ThemedText style={{ color: "red", textAlign: "center" }}>
            Access Denied. You do not have permission to view teachers.
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
            <ThemedText type="title">Teachers</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Faculty Directory & Department Roster
            </ThemedText>
          </View>

          {/* Search */}
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Search by name, specialization, or email..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />

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

          {/* List */}
          {!isLoading && (
            <View style={styles.list}>
              {filtered.length === 0 && !error && (
                <ThemedText
                  themeColor="textSecondary"
                  style={{ textAlign: "center", marginTop: Spacing.four }}
                >
                  No teachers found.
                </ThemedText>
              )}
              {filtered.map((t) => (
                <ThemedView
                  key={t._id || t.id}
                  type="backgroundElement"
                  style={styles.card}
                >
                  <View style={styles.cardTop}>
                    <ThemedText style={styles.teacherName}>
                      {t.firstName} {t.lastName}
                    </ThemedText>
                    <View
                      style={[
                        styles.deptTag,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    >
                      <ThemedText type="code" style={{ fontSize: 11 }}>
                        {t.specialization || "Faculty"}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t.email}
                  </ThemedText>
                  {t.employeeId && (
                    <ThemedText type="small" themeColor="textSecondary">
                      Employee ID: {t.employeeId}
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
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: Spacing.four,
  },
  list: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teacherName: { fontSize: 16, fontWeight: "600" },
  deptTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
});
