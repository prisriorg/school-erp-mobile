import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore, UserRole } from "@/store/authStore";
import { api } from "@/lib/api";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useTheme();
  const router = useRouter();

  const role: UserRole = user?.role || "student";

  const {
    data: stats,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load dashboard" : null;

  const getDashboardContent = () => {
    switch (role) {
      case "admin":
      case "principal":
      case "manager":
        return {
          title: "System Administrator Control Center",
          subtitle:
            "Manage school entities, credentials, invoicing, and directories.",
          stats: [
            {
              label: "Total Students",
              value: stats?.students ?? "—",
              subtext: "Enrolled",
            },
            {
              label: "Total Teachers",
              value: stats?.teachers ?? "—",
              subtext: "Active Faculty",
            },
            {
              label: "Classes",
              value: stats?.classes ?? "—",
              subtext: "Sections",
            },
            {
              label: "Avg Attendance",
              value: stats?.attendance ? `${stats.attendance}%` : "—",
              subtext: "This Month",
            },
          ],
          modules: [
            {
              title: "Student Management",
              desc: "Add, update, or remove student profiles and link classroom entries.",
              route: "/students",
            },
            {
              title: "Faculty Directory",
              desc: "Manage instructor details, departments, and user logins.",
              route: "/teachers",
            },
            {
              title: "Fee Invoicing",
              desc: "Generate bills, mark off transaction records, and monitor arrears.",
              route: "/fees",
            },
            {
              title: "Account Settings",
              desc: "Assign passwords and security access levels across modules.",
              route: "/users",
            },
          ],
        };

      case "teacher":
        return {
          title: "Faculty Workspace",
          subtitle:
            "Access student rosters, daily rolls, and term exam gradebook inputs.",
          stats: [
            {
              label: "Assigned Students",
              value: stats?.students ?? "—",
              subtext: "Across Classes",
            },
            {
              label: "Classrooms",
              value: stats?.classes ?? "—",
              subtext: "Sections",
            },
            {
              label: "Daily Roll",
              value: stats?.attendance ? "Done" : "Pending",
              subtext: "Today",
            },
            {
              label: "Class Average",
              value: stats?.classAverage ?? "—",
              subtext: "Term 1",
            },
          ],
          modules: [
            {
              title: "Class Registers",
              desc: "Log daily class rosters (Present/Absent rolls) and save daily reports.",
              route: "/attendance",
            },
            {
              title: "Exam Grading",
              desc: "Record midterm or final test scores for your class rosters.",
              route: "/exams",
            },
            {
              title: "Student Directory",
              desc: "Verify parent phone numbers, home addresses, and details.",
              route: "/students",
            },
          ],
        };

      case "student":
      case "parent":
      default:
        return {
          title: role === "parent" ? "Parent Portal" : "Student Dashboard",
          subtitle:
            "View academic progress, track schedules, and clear fee dues.",
          stats: [
            {
              label: "Attendance Rate",
              value: stats?.attendance ? `${stats.attendance}%` : "—",
              subtext: "This Term",
            },
            {
              label: "Grade Average",
              value: stats?.gradeAverage ?? "—",
              subtext: "GPA",
            },
            {
              label: "Outstanding Dues",
              value: stats?.outstandingDues
                ? `₹${stats.outstandingDues}`
                : "₹0",
              subtext: stats?.outstandingDues ? "Pending" : "Clear",
            },
            {
              label: "Current Class",
              value: stats?.currentClass ?? "—",
              subtext: stats?.currentRoom ?? "",
            },
          ],
          modules: [
            {
              title: "Check-in Records",
              desc: "Monitor daily attendance check-ins and late histories.",
              route: "/attendance",
            },
            {
              title: "Term Marksheets",
              desc: "Check published midterm or final report cards and scores.",
              route: "/exams",
            },
            {
              title: "Pay Invoices",
              desc: "Track pending tuition fees and download receipt summaries.",
              route: "/fees",
            },
          ],
        };
    }
  };

  const dashboard = getDashboardContent();

  return (
    <Screen
      refreshing={isLoading}
      onRefresh={refetch}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="small" themeColor="textSecondary">
              Logged in as {user?.email}
            </ThemedText>
            <ThemedText type="title" style={styles.mainTitle}>
              {dashboard.title}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.subtitle}
            >
              {dashboard.subtitle}
            </ThemedText>
          </View>
          <Badge
            label={role.toUpperCase()}
            style={{ marginTop: Spacing.two }}
          />
        </View>

        {/* Loading / Error States */}
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={theme.text}
            style={{ marginVertical: Spacing.six }}
          />
        )}

        {error && !isLoading && (
          <Card style={{ marginBottom: Spacing.four, borderColor: "#ef4444" }}>
            <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
          </Card>
        )}

        {/* Stats Grid */}
        <ThemedText type="smallBold" style={styles.sectionHeader}>
          KEY METRICS
        </ThemedText>
        <View style={styles.statsGrid}>
          {dashboard.stats.map((stat, idx) => (
            <Card key={idx} style={styles.statCard}>
              <ThemedText type="small" themeColor="textSecondary">
                {stat.label}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>
                {isLoading ? "..." : stat.value}
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.statSubtext}
              >
                {stat.subtext}
              </ThemedText>
            </Card>
          ))}
        </View>

        {/* Available Modules */}
        <ThemedText type="smallBold" style={styles.sectionHeader}>
          AVAILABLE MODULES
        </ThemedText>
        <View style={styles.modulesContainer}>
          {dashboard.modules.map((mod, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => router.push(mod.route as any)}
            >
              <Card style={styles.moduleCard}>
                <ThemedText style={styles.moduleTitle}>{mod.title}</ThemedText>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.moduleDesc}
                >
                  {mod.desc}
                </ThemedText>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <Button
          variant="outline"
          title="Sign Out"
          style={{ marginTop: Spacing.six }}
          onPress={() => logout()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    marginBottom: Spacing.four,
    gap: Spacing.one,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.half,
  },
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    marginVertical: Spacing.half,
  },
  statSubtext: {
    fontSize: 12,
  },
  modulesContainer: {
    gap: Spacing.three,
  },
  moduleCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  moduleDesc: {
    lineHeight: 18,
  },
});
