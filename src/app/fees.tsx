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
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";

export default function FeesScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { hasPermission } = usePermission();
  const canViewFees = hasPermission("FEES.VIEW");

  const {
    data: invoices = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const res = await api.get("/fees");
      return res.data;
    },
    enabled: canViewFees,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load fees" : null;

  // Calculate totals
  const totalDues = invoices
    .filter((inv: any) => inv.status === "Pending" || inv.status === "pending")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  if (!canViewFees) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view fees.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <ThemedText type="title">Finance & Fees</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Fee Invoices, Dues & Payments
        </ThemedText>
      </View>

      {/* Dues Summary */}
      <Card style={styles.summaryCard}>
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            Total Outstanding Dues
          </ThemedText>
          <ThemedText type="subtitle" style={styles.dueAmount}>
            {isLoading ? "..." : `₹${totalDues.toLocaleString()}`}
          </ThemedText>
        </View>

        {(user?.role === "student" || user?.role === "parent") && (
          <Button title="Pay All" />
        )}
      </Card>

      {/* Loading / Error */}
      {isLoading && (
        <ActivityIndicator size="large" color={theme.text} style={{ marginVertical: Spacing.six }} />
      )}

      {error && !isLoading && (
        <Card style={{ borderColor: "#ef4444", marginBottom: Spacing.four }}>
          <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
        </Card>
      )}

      {/* Invoice List */}
      {!isLoading && (
        <>
          <ThemedText type="smallBold" style={styles.sectionHeader}>
            ALL INVOICES ({invoices.length})
          </ThemedText>
          <View style={styles.list}>
            {invoices.length === 0 && !error && (
              <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
                No invoices found.
              </ThemedText>
            )}
            {invoices.map((inv: any, idx: number) => {
              const isPaid = inv.status === "Paid" || inv.status === "paid";
              const statusLabel = isPaid ? "Paid" : inv.status || "Pending";
              const badgeType = isPaid ? "success" : "default";

              return (
                <Card key={inv.id || idx} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.invTitle}>
                        {inv.feeType || "Invoice"}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {inv.dueDate ? `Due: ${new Date(inv.dueDate).toLocaleDateString()}` : ""}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.invAmount}>
                      ₹{Number(inv.amount || 0).toLocaleString()}
                    </ThemedText>
                  </View>

                  <View style={styles.cardFooter}>
                    <Badge label={statusLabel} type={badgeType as any} />

                    {inv.student && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {inv.student}
                      </ThemedText>
                    )}
                  </View>
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
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  dueAmount: { fontSize: 26, fontWeight: "700", marginTop: 4 },
  payBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  invTitle: { fontSize: 16, fontWeight: "600" },
  invAmount: { fontSize: 18, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#8882",
    paddingTop: Spacing.two,
  },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});
