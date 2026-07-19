import { useState } from "react";
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
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StudentsScreen() {
  const theme = useTheme();
  const { hasPermission } = usePermission();
  const canViewStudents = hasPermission("STUDENTS.PROFILE.VIEW");
  const canAddStudent = hasPermission("STUDENTS.PROFILE.CREATE");

  const queryClient = useQueryClient();

  const {
    data: students = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await api.get("/students");
      return res.data;
    },
    enabled: canViewStudents,
  });

  const error = queryError ? (queryError as any).response?.data?.message || "Failed to load students" : null;
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New student form state
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newAdmissionNumber, setNewAdmissionNumber] = useState("");
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

  const addMutation = useMutation({
    mutationFn: async () => {
      return api.post("/students", {
        email: newEmail,
        firstName: newFirstName,
        lastName: newLastName,
        admissionNumber: newAdmissionNumber,
      });
    },
    onSuccess: () => {
      setNewEmail("");
      setNewFirstName("");
      setNewLastName("");
      setNewAdmissionNumber("");
      setValidationErrors({});
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handleAddStudent = () => {
    if (!validateForm()) return;
    addMutation.mutate();
  };

  const isSaving = addMutation.isPending;
  const combinedError = error || (addMutation.error ? (addMutation.error as any).response?.data?.message || "Failed to add student" : null);

  const filtered = students.filter((s: any) => {
    const q = search.toLowerCase();
    const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const email = (s.email || "").toLowerCase();
    const admNo = (s.admissionNumber || "").toLowerCase();
    return name.includes(q) || email.includes(q) || admNo.includes(q);
  });

  if (!canViewStudents) {
    return (
      <Screen scrollable={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText style={{ color: "#ef4444", textAlign: "center" }}>
            Access Denied. You do not have permission to view students.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="title">Students</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Directory & Enrollment Records
          </ThemedText>
        </View>

        {canAddStudent && (
          <Button
            title={showAddForm ? "Close" : "+ Add"}
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
          />
        )}
      </View>

      {/* Add Form Sheet */}
      {showAddForm && (
        <Card style={{ marginBottom: Spacing.four }}>
          <ThemedText type="smallBold" style={{ marginBottom: Spacing.four }}>
            Enroll New Student
          </ThemedText>
          
          <Input
            placeholder="Email"
            value={newEmail}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            error={validationErrors.email}
          />
          
          <Input
            placeholder="First Name"
            value={newFirstName}
            onChangeText={handleFirstNameChange}
            error={validationErrors.firstName}
          />
          
          <Input
            placeholder="Last Name"
            value={newLastName}
            onChangeText={handleLastNameChange}
            error={validationErrors.lastName}
          />
          
          <Input
            placeholder="Admission Number"
            value={newAdmissionNumber}
            onChangeText={handleAdmissionNumberChange}
            error={validationErrors.admissionNumber}
          />
          
          <Button
            title="Save Record"
            onPress={handleAddStudent}
            isLoading={isSaving}
          />
        </Card>
      )}
      {combinedError && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{combinedError}</ThemedText>
        </ThemedView>
      )}

      {/* Search Bar */}
      <Input
        placeholder="Search student name, email, or admission no..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Loading / Error */}
      {isLoading && (
        <ActivityIndicator size="large" color={theme.text} style={{ marginVertical: Spacing.six }} />
      )}

      {error && !isLoading && (
        <Card style={{ borderColor: "#ef4444", marginBottom: Spacing.four }}>
          <ThemedText style={{ color: "#ef4444" }}>{error}</ThemedText>
        </Card>
      )}

      {/* Student List */}
      {!isLoading && (
        <View style={styles.listContainer}>
          {filtered.length === 0 && !error && (
            <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.four }}>
              No students found.
            </ThemedText>
          )}
          {filtered.map((student: any) => (
            <Card key={student._id || student.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {student.email}
                    {student.admissionNumber ? ` • ${student.admissionNumber}` : ""}
                  </ThemedText>
                </View>
                <Badge label={student.gender?.toUpperCase() || "STUDENT"} />
              </View>

              {student.class && (
                <View style={styles.cardFooter}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Class: {student.class?.name || student.class?.section || "Unassigned"}
                  </ThemedText>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}
    </Screen>
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
  errorContainer: {
    backgroundColor: "#ef444420",
    padding: Spacing.four,
    borderRadius: 8,
    marginBottom: Spacing.four,
  },
  errorText: {
    color: "#ef4444",
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
