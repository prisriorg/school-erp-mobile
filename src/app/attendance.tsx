import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function AttendanceScreen() {
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();
  const isTeacherOrAdmin = [
    "admin",
    "manager",
    "principal",
    "teacher",
  ].includes(user?.role || "");

  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [attRes, studRes, clsRes] = await Promise.all([
        api.get("/attendance"),
        isTeacherOrAdmin ? api.get("/students") : Promise.resolve({ data: [] }),
        isTeacherOrAdmin ? api.get("/classes") : Promise.resolve({ data: [] }),
      ]);
      setAttendanceData(attRes.data);
      setStudents(studRes.data);
      setClasses(clsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load attendance");
    }
  }, [isTeacherOrAdmin]);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Build a flat list of recent attendance records for display
  const records: any[] = [];
  if (attendanceData && typeof attendanceData === "object") {
    // attendanceData can be a map of date -> records[] or a flat array
    if (Array.isArray(attendanceData)) {
      records.push(...attendanceData);
    } else {
      Object.values(attendanceData).forEach((dateRecords: any) => {
        if (Array.isArray(dateRecords)) {
          records.push(...dateRecords);
        }
      });
    }
  }

  const presentCount = records.filter(
    (r) => r.status === "Present" || r.status === "present",
  ).length;
  const absentCount = records.filter(
    (r) => r.status === "Absent" || r.status === "absent",
  ).length;

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
            <ThemedText type="title">Attendance</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Daily Class Register
            </ThemedText>
          </View>

          {/* Quick Summary */}
          <View style={styles.statsRow}>
            <ThemedView type="backgroundElement" style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">
                Present
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statNum}>
                {isLoading ? "..." : presentCount}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">
                Absent
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statNum}>
                {isLoading ? "..." : absentCount}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">
                Total
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statNum}>
                {isLoading ? "..." : records.length}
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

          {/* Records List */}
          {!isLoading && (
            <>
              <ThemedText type="smallBold" style={styles.listHeader}>
                ATTENDANCE RECORDS
              </ThemedText>
              <View style={styles.list}>
                {records.length === 0 && !error && (
                  <ThemedText
                    themeColor="textSecondary"
                    style={{ textAlign: "center", marginTop: Spacing.four }}
                  >
                    No attendance records found.
                  </ThemedText>
                )}
                {records.slice(0, 20).map((item, idx) => {
                  const studentName =
                    item.student?.firstName && item.student?.lastName
                      ? `${item.student.firstName} ${item.student.lastName}`
                      : item.studentName || `Student ${idx + 1}`;

                  const statusNormalized =
                    (item.status || "").charAt(0).toUpperCase() +
                    (item.status || "").slice(1).toLowerCase();

                  return (
                    <ThemedView
                      key={item._id || idx}
                      type="backgroundElement"
                      style={styles.card}
                    >
                      <View>
                        <ThemedText style={styles.studentName}>
                          {studentName}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : ""}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor:
                              statusNormalized === "Present"
                                ? theme.primary
                                : statusNormalized === "Absent"
                                  ? theme.borderSelected
                                  : theme.backgroundSelected,
                          },
                        ]}
                      >
                        <ThemedText
                          type="code"
                          style={{
                            color:
                              statusNormalized === "Present"
                                ? theme.primaryForeground
                                : theme.text,
                            fontWeight: "600",
                          }}
                        >
                          {statusNormalized}
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
  listHeader: { fontSize: 13, letterSpacing: 0.8, marginBottom: Spacing.two },
  list: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentName: { fontSize: 16, fontWeight: "600" },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
});
