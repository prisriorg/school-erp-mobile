import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function StudentsScreen() {
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();
  const isAdmin = ["admin", "manager", "principal"].includes(
    user?.role || "",
  );

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New student form state
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newAdmissionNumber, setNewAdmissionNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load students");
    }
  }, []);

  useEffect(() => {
    fetchStudents().finally(() => setIsLoading(false));
  }, [fetchStudents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const handleAddStudent = async () => {
    if (!newEmail.trim() || !newFirstName.trim()) return;
    setIsSaving(true);
    try {
      await api.post("/students", {
        email: newEmail,
        firstName: newFirstName,
        lastName: newLastName,
        admissionNumber: newAdmissionNumber,
      });
      setNewEmail("");
      setNewFirstName("");
      setNewLastName("");
      setNewAdmissionNumber("");
      setShowAddForm(false);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add student");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const email = (s.email || "").toLowerCase();
    const admNo = (s.admissionNumber || "").toLowerCase();
    return name.includes(q) || email.includes(q) || admNo.includes(q);
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title">Students</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Directory & Enrollment Records
              </ThemedText>
            </View>

            {isAdmin && (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <ThemedText
                  style={{
                    color: theme.primaryForeground,
                    fontWeight: "600",
                  }}
                >
                  {showAddForm ? "Close" : "+ Add"}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Form Sheet */}
          {showAddForm && (
            <ThemedView type="backgroundElement" style={styles.formCard}>
              <ThemedText
                type="smallBold"
                style={{ marginBottom: Spacing.two }}
              >
                Enroll New Student
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="First Name"
                placeholderTextColor={theme.textSecondary}
                value={newFirstName}
                onChangeText={setNewFirstName}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Last Name"
                placeholderTextColor={theme.textSecondary}
                value={newLastName}
                onChangeText={setNewLastName}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Admission Number"
                placeholderTextColor={theme.textSecondary}
                value={newAdmissionNumber}
                onChangeText={setNewAdmissionNumber}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleAddStudent}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.primaryForeground} />
                ) : (
                  <ThemedText
                    style={{
                      color: theme.primaryForeground,
                      fontWeight: "700",
                    }}
                  >
                    Save Record
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          )}

          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Search student name, email, or admission no..."
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

          {/* Student List */}
          {!isLoading && (
            <View style={styles.listContainer}>
              {filtered.length === 0 && !error && (
                <ThemedText
                  themeColor="textSecondary"
                  style={{ textAlign: "center", marginTop: Spacing.four }}
                >
                  No students found.
                </ThemedText>
              )}
              {filtered.map((student) => (
                <ThemedView
                  key={student._id || student.id}
                  type="backgroundElement"
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.studentName}>
                        {student.firstName} {student.lastName}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {student.email}
                        {student.admissionNumber
                          ? ` • ${student.admissionNumber}`
                          : ""}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    >
                      <ThemedText type="code" style={{ fontSize: 11 }}>
                        {student.gender || "Student"}
                      </ThemedText>
                    </View>
                  </View>

                  {student.class && (
                    <View style={styles.cardFooter}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Class:{" "}
                        {student.class?.name ||
                          student.class?.section ||
                          "Unassigned"}
                      </ThemedText>
                    </View>
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
  contentWrapper: { flex: 1, width: "100%", maxWidth: MaxContentWidth },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  addButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  formCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  submitButton: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.one,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: Spacing.four,
  },
  listContainer: { gap: Spacing.three },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  studentName: { fontSize: 17, fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#8882",
    paddingTop: Spacing.two,
  },
});
