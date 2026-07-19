import { useState } from "react";
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
import { usePermission } from "@/hooks/usePermission";
import { api } from "@/lib/api";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useQuery } from "@tanstack/react-query";

export default function AttendanceScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewAttendance = hasPermission("ATTENDANCE.VIEW");
  const canManageAttendance = hasPermission("ATTENDANCE.MANAGE");

  const {
    data = {},
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const [attRes, studRes, clsRes] = await Promise.all([
        api.get("/attendance"),
        canManageAttendance ? api.get("/students") : Promise.resolve({ data: [] }),
        canManageAttendance ? api.get("/classes") : Promise.resolve({ data: [] }),
      ]);
      return {
        attendanceData: attRes.data,
        students: studRes.data,
        classes: clsRes.data,
      };
    },
    enabled: canViewAttendance,
  });

  const { attendanceData = null, students = [], classes = [] } = data as any;
  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load attendance" : null;

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

  if (!canViewAttendance) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view attendance.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">Attendance</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Daily Class Register
        </ThemedText>
      </View>

      {/* Quick Summary */}
      <View style={styles.statsRow}>
        <Card style={styles.statBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Present
          </ThemedText>
          <ThemedText type="subtitle" style={styles.statNum}>
            {isLoading ? "..." : presentCount}
          </ThemedText>
        </Card>
        <Card style={styles.statBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Absent
          </ThemedText>
          <ThemedText type="subtitle" style={styles.statNum}>
            {isLoading ? "..." : absentCount}
          </ThemedText>
        </Card>
        <Card style={styles.statBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Total
          </ThemedText>
          <ThemedText type="subtitle" style={styles.statNum}>
            {isLoading ? "..." : records.length}
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

      {/* Records List */}
      {!isLoading && (
        <>
          <ThemedText type="smallBold" style={styles.listHeader}>
            ATTENDANCE RECORDS
          </ThemedText>
          <View style={styles.list}>
            {records.length === 0 && !error && (
              <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
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

              const badgeType = statusNormalized === "Present" ? "success" 
                : statusNormalized === "Absent" ? "error" 
                : "default";

              return (
                <Card key={item._id || idx} style={styles.card}>
                  <View>
                    <ThemedText style={styles.studentName}>
                      {studentName}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.date ? new Date(item.date).toLocaleDateString() : ""}
                    </ThemedText>
                  </View>
                  <Badge label={statusNormalized} type={badgeType as any} />
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
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
  },
  statNum: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  listHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.three,
  },
  list: { gap: Spacing.two },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentName: { fontSize: 16, fontWeight: "500" },
});
