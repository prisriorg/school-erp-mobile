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

export default function HRScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewHR = hasPermission("HR.VIEW");

  const [payroll, setPayroll] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [payrollRes, leavesRes] = await Promise.all([
        api.get("/hr/payroll"),
        api.get("/hr/leaves"),
      ]);
      setPayroll(payrollRes.data);
      setLeaves(leavesRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load HR data");
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!canViewHR) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four }}>
          <ThemedText style={{ color: "red", textAlign: "center" }}>
            Access Denied. You do not have permission to view HR records.
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
          <View style={styles.header}>
            <ThemedText type="title">HR & Payroll</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Staff Directory, Salary & Leave Management
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

          {/* Payroll Section */}
          {!isLoading && (
            <>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                PAYROLL RECORDS ({payroll.length})
              </ThemedText>
              <View style={styles.list}>
                {payroll.length === 0 && !error && (
                  <ThemedText
                    themeColor="textSecondary"
                    style={{ textAlign: "center", marginTop: Spacing.four }}
                  >
                    No payroll records found.
                  </ThemedText>
                )}
                {payroll.map((item, idx) => {
                  const staffName =
                    item.teacher?.firstName && item.teacher?.lastName
                      ? `${item.teacher.firstName} ${item.teacher.lastName}`
                      : item.staffName || `Staff ${idx + 1}`;

                  return (
                    <ThemedView
                      key={item._id || idx}
                      type="backgroundElement"
                      style={styles.card}
                    >
                      <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.name}>
                            {staffName}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {item.month || ""} {item.year || ""}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.salary}>
                          ₹{(item.amount || item.salary || 0).toLocaleString()}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: theme.backgroundSelected },
                        ]}
                      >
                        <ThemedText type="code" style={{ fontSize: 11 }}>
                          Status: {item.status || "Pending"}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  );
                })}
              </View>

              {/* Leave Requests */}
              {leaves.length > 0 && (
                <>
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.sectionHeader,
                      { marginTop: Spacing.six },
                    ]}
                  >
                    LEAVE REQUESTS ({leaves.length})
                  </ThemedText>
                  <View style={styles.list}>
                    {leaves.map((leave, idx) => {
                      const staffName =
                        leave.teacher?.firstName && leave.teacher?.lastName
                          ? `${leave.teacher.firstName} ${leave.teacher.lastName}`
                          : `Staff ${idx + 1}`;

                      return (
                        <ThemedView
                          key={leave._id || idx}
                          type="backgroundElement"
                          style={styles.card}
                        >
                          <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={styles.name}>
                                {staffName}
                              </ThemedText>
                              <ThemedText
                                type="small"
                                themeColor="textSecondary"
                              >
                                {leave.type || "Leave"} •{" "}
                                {leave.startDate
                                  ? new Date(
                                      leave.startDate,
                                    ).toLocaleDateString()
                                  : ""}{" "}
                                →{" "}
                                {leave.endDate
                                  ? new Date(
                                      leave.endDate,
                                    ).toLocaleDateString()
                                  : ""}
                              </ThemedText>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: theme.backgroundSelected },
                            ]}
                          >
                            <ThemedText type="code" style={{ fontSize: 11 }}>
                              {leave.status || "Pending"}
                            </ThemedText>
                          </View>
                        </ThemedView>
                      );
                    })}
                  </View>
                </>
              )}
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
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  list: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "600" },
  salary: { fontSize: 15, fontWeight: "700" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
