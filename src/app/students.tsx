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
import { usePermission } from "@/hooks/usePermission";
import { api } from "@/lib/api";

export default function StudentsScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewStudents = hasPermission("STUDENTS.PROFILE.VIEW");
  const canAddStudent = hasPermission("STUDENTS.PROFILE.CREATE");

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!newEmail.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!newFirstName.trim()) {
      errs.firstName = "First name is required";
    } else if (newFirstName.trim().length < 2) {
      errs.firstName = "First name must be at least 2 characters";
    }

    if (!newLastName.trim()) {
      errs.lastName = "Last name is required";
    } else if (newLastName.trim().length < 2) {
      errs.lastName = "Last name must be at least 2 characters";
    }

    if (!newAdmissionNumber.trim()) {
      errs.admissionNumber = "Admission number is required";
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailChange = (text: string) => {
    setNewEmail(text);
    if (validationErrors.email) {
      setValidationErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleFirstNameChange = (text: string) => {
    setNewFirstName(text);
    if (validationErrors.firstName) {
      setValidationErrors((prev) => {
        const { firstName, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleLastNameChange = (text: string) => {
    setNewLastName(text);
    if (validationErrors.lastName) {
      setValidationErrors((prev) => {
        const { lastName, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAdmissionNumberChange = (text: string) => {
    setNewAdmissionNumber(text);
    if (validationErrors.admissionNumber) {
      setValidationErrors((prev) => {
        const { admissionNumber, ...rest } = prev;
        return rest;
      });
    }
  };

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
    if (!validateForm()) return;
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
      setValidationErrors({});
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

  if (!canViewStudents) {
    return (
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.four }}>
          <ThemedText style={{ color: "red", textAlign: "center" }}>
            Access Denied. You do not have permission to view students.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

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

            {canAddStudent && (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => {
                  if (showAddForm) {
                    setNewEmail("");
                    setNewFirstName("");
                    setNewLastName("");
                    setNewAdmissionNumber("");
                    setValidationErrors({});
                  }
                  setShowAddForm(!showAddForm);
                }}
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
                    borderColor: validationErrors.email ? "#EF4444" : theme.border,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={newEmail}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {validationErrors.email && (
                <ThemedText style={{ color: "#EF4444", fontSize: 11, marginTop: -Spacing.two, marginBottom: Spacing.two }}>
                  {validationErrors.email}
                </ThemedText>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: validationErrors.firstName ? "#EF4444" : theme.border,
                  },
                ]}
                placeholder="First Name"
                placeholderTextColor={theme.textSecondary}
                value={newFirstName}
                onChangeText={handleFirstNameChange}
              />
              {validationErrors.firstName && (
                <ThemedText style={{ color: "#EF4444", fontSize: 11, marginTop: -Spacing.two, marginBottom: Spacing.two }}>
                  {validationErrors.firstName}
                </ThemedText>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: validationErrors.lastName ? "#EF4444" : theme.border,
                  },
                ]}
                placeholder="Last Name"
                placeholderTextColor={theme.textSecondary}
                value={newLastName}
                onChangeText={handleLastNameChange}
              />
              {validationErrors.lastName && (
                <ThemedText style={{ color: "#EF4444", fontSize: 11, marginTop: -Spacing.two, marginBottom: Spacing.two }}>
                  {validationErrors.lastName}
                </ThemedText>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: validationErrors.admissionNumber ? "#EF4444" : theme.border,
                  },
                ]}
                placeholder="Admission Number"
                placeholderTextColor={theme.textSecondary}
                value={newAdmissionNumber}
                onChangeText={handleAdmissionNumberChange}
              />
              {validationErrors.admissionNumber && (
                <ThemedText style={{ color: "#EF4444", fontSize: 11, marginTop: -Spacing.two, marginBottom: Spacing.two }}>
                  {validationErrors.admissionNumber}
                </ThemedText>
              )}
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
