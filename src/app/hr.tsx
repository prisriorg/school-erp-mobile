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

export default function HRScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewHR = hasPermission("HR.VIEW");

  const {
    data = {},
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["hr"],
    queryFn: async () => {
      const [payrollRes, leavesRes] = await Promise.all([
        api.get("/hr/payroll"),
        api.get("/hr/leaves"),
      ]);
      return {
        payroll: payrollRes.data,
        leaves: leavesRes.data,
      };
    },
    enabled: canViewHR,
  });

  const { payroll = [], leaves = [] } = data as any;
  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load HR data" : null;

  if (!canViewHR) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view HR records.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">HR & Payroll</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Staff Directory, Salary & Leave Management
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

      {/* Payroll Section */}
      {!isLoading && (
        <>
          <ThemedText type="smallBold" style={styles.sectionHeader}>
            PAYROLL RECORDS ({payroll.length})
          </ThemedText>
          <View style={styles.list}>
            {payroll.length === 0 && !error && (
              <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
                No payroll records found.
              </ThemedText>
            )}
            {payroll.map((item: any, idx: number) => {
              const staffName =
                item.teacher?.firstName && item.teacher?.lastName
                  ? `${item.teacher.firstName} ${item.teacher.lastName}`
                  : item.staffName || `Staff ${idx + 1}`;

              const status = item.status || "Pending";
              const badgeType = status.toLowerCase() === "paid" ? "success" : "default";

              return (
                <Card key={item._id || idx} style={styles.card}>
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
                  <Badge label={`Status: ${status}`} type={badgeType as any} />
                </Card>
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
                {leaves.map((leave: any, idx: number) => {
                  const staffName =
                    leave.teacher?.firstName && leave.teacher?.lastName
                      ? `${leave.teacher.firstName} ${leave.teacher.lastName}`
                      : `Staff ${idx + 1}`;

                  const status = leave.status || "Pending";
                  const badgeType = status.toLowerCase() === "approved" ? "success" 
                    : status.toLowerCase() === "rejected" ? "error" 
                    : "default";

                  return (
                    <Card key={leave._id || idx} style={styles.card}>
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
                      <Badge label={status} type={badgeType as any} />
                    </Card>
                  );
                })}
              </View>
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  list: { gap: Spacing.three },
  card: { gap: Spacing.two },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "600" },
  salary: { fontSize: 18, fontWeight: "700" },
});
