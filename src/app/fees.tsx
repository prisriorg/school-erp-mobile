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
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";

export default function FeesScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { hasPermission } = usePermission();
  const canViewFees = hasPermission("FEES.VIEW");

  const [invoices, setInvoices] = useState<
    {
      amount: number;
      baseAmount: number;
      date: string;
      discountId: null;
      dueDate: string;
      feeType: string;
      id: string;
      lastName: string;
      lateFeeApplied: boolean;
      paymentMethod: string;
      ref: string;
      remarks: string;
      status: string;
      student: string;
      studentId: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    try {
      const res = await api.get("/fees");
      setInvoices(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load fees");
    }
  }, []);

  useEffect(() => {
    fetchFees().finally(() => setIsLoading(false));
    console.log(invoices);
  }, [fetchFees]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFees();
    setRefreshing(false);
  };

  // Calculate totals
  const totalDues = invoices
    .filter((inv) => inv.status === "Pending" || inv.status === "pending")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  if (!canViewFees) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four }}>
          <ThemedText style={{ color: "red", textAlign: "center" }}>
            Access Denied. You do not have permission to view fees.
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
            <ThemedText type="title">Finance & Fees</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Fee Invoices, Dues & Payments
            </ThemedText>
          </View>

          {/* Dues Summary */}
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Total Outstanding Dues
              </ThemedText>
              <ThemedText type="subtitle" style={styles.dueAmount}>
                {isLoading ? "..." : `₹${totalDues.toLocaleString()}`}
              </ThemedText>
            </View>

            {user?.role === "student" ||
              (user?.role === "parent" && (
                <TouchableOpacity
                  style={[styles.payBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText
                    style={{
                      color: theme.primaryForeground,
                      fontWeight: "700",
                    }}
                  >
                    Pay All
                  </ThemedText>
                </TouchableOpacity>
              ))}
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

          {/* Invoice List */}
          {!isLoading && (
            <>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                ALL INVOICES ({invoices.length})
              </ThemedText>
              <View style={styles.list}>
                {invoices.length === 0 && !error && (
                  <ThemedText
                    themeColor="textSecondary"
                    style={{ textAlign: "center", marginTop: Spacing.four }}
                  >
                    No invoices found.
                  </ThemedText>
                )}
                {invoices.map((inv, idx) => {
                  const isPaid = inv.status === "Paid" || inv.status === "paid";
                  const statusLabel = isPaid ? "Paid" : inv.status || "Pending";

                  return (
                    <ThemedView
                      key={inv.id || idx}
                      type="backgroundElement"
                      style={styles.card}
                    >
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.invTitle}>
                            {inv.feeType || "Invoice"}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {inv.dueDate
                              ? `Due: ${new Date(inv.dueDate).toLocaleDateString()}`
                              : ""}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.invAmount}>
                          ₹{Number(inv.amount || 0).toLocaleString()}
                        </ThemedText>
                      </View>

                      <View style={styles.cardFooter}>
                        <View
                          style={[
                            styles.statusTag,
                            {
                              backgroundColor: isPaid
                                ? theme.primary
                                : theme.backgroundSelected,
                            },
                          ]}
                        >
                          <ThemedText
                            type="code"
                            style={{
                              color: isPaid
                                ? theme.primaryForeground
                                : theme.text,
                              fontSize: 11,
                            }}
                          >
                            {statusLabel}
                          </ThemedText>
                        </View>

                        {inv.student && (
                          <ThemedText type="small" themeColor="textSecondary">
                            {inv.student}
                          </ThemedText>
                        )}
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
