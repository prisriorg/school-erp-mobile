import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { SymbolView, SymbolViewProps } from "expo-symbols";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";
import { useRolesStore } from "@/store/rolesStore";
import { Spacing } from "@/constants/theme";

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  route: string;
  iconName: SymbolViewProps["name"];
}

export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useTheme();

  const [slideAnim] = useState(() => new Animated.Value(-290));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -290,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    onClose();
  };

  const { hasPermission } = usePermission();
  const roles = useRolesStore((state) => state.roles);
  const updateRole = useAuthStore((state) => state.updateRole);

  const role = user?.role || "student";

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      route: "/",
      iconName: { ios: "house.fill", android: "home", web: "house" },
    },
  ];

  if (hasPermission("STUDENTS.PROFILE.VIEW")) {
    menuItems.push({
      name: "Students",
      route: "/students",
      iconName: { ios: "person.2.fill", android: "person", web: "group" },
    });
  }

  if (hasPermission("TEACHERS.VIEW")) {
    menuItems.push({
      name: "Teachers",
      route: "/teachers",
      iconName: {
        ios: "person.crop.rectangle.fill",
        android: "person",
        web: "person",
      },
    });
  }

  if (hasPermission("ACADEMICS.CLASSES.VIEW")) {
    menuItems.push({
      name: "Classes",
      route: "/classes",
      iconName: {
        ios: "rectangle.3.group.fill",
        android: "apps",
        web: "apps",
      },
    });
  }

  if (hasPermission("ATTENDANCE.VIEW")) {
    menuItems.push({
      name: "Attendance",
      route: "/attendance",
      iconName: { ios: "calendar", android: "event", web: "event" },
    });
  }

  if (hasPermission("EXAMS.VIEW")) {
    menuItems.push({
      name: "Exams & Marks",
      route: "/exams",
      iconName: {
        ios: "doc.text.fill",
        android: "description",
        web: "description",
      },
    });
  }

  if (hasPermission("FEES.VIEW")) {
    menuItems.push({
      name: "Finance & Fees",
      route: "/fees",
      iconName: {
        ios: "creditcard.fill",
        android: "payment",
        web: "credit_card",
      },
    });
  }

  if (hasPermission("HR.VIEW")) {
    menuItems.push({
      name: "HR & Payroll",
      route: "/hr",
      iconName: { ios: "briefcase.fill", android: "work", web: "work" },
    });
  }

  if (hasPermission("USERS.VIEW")) {
    menuItems.push({
      name: "System Users",
      route: "/users",
      iconName: {
        ios: "person.badge.key.fill",
        android: "vpn_key",
        web: "key",
      },
    });
  }

  const navigateTo = (route: string) => {
    handleClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Animated Backdrop */}
        <Animated.View style={[styles.backdropAnimated, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Animated Left Drawer Content */}
        <Animated.View
          style={[
            styles.drawerContainerAnimated,
            {
              backgroundColor: theme.background,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[styles.drawerHeader, { borderBottomColor: theme.border }]}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <SymbolView
                name={{
                  ios: "graduationcap.fill",
                  android: "school",
                  web: "school",
                }}
                size={22}
                tintColor={theme.text}
              />
              <ThemedText type="subtitle" style={styles.brandTitle}>
                Academia ERP
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                size={18}
                tintColor={theme.text}
              />
            </TouchableOpacity>
          </View>

          {/* User Profile Summary */}
          <ThemedView type="backgroundElement" style={styles.profileCard}>
            <View style={styles.profileRow}>
              <SymbolView
                name={{
                  ios: "person.crop.circle.fill",
                  android: "account_circle",
                  web: "person",
                }}
                size={32}
                tintColor={theme.text}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: "600" }}>
                  {user?.name || "User"}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {user?.email}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText type="code" style={{ fontSize: 11 }}>
                ROLE: {role.toUpperCase()}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Menu Links */}
          <ScrollView
            style={styles.menuList}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isActive
                        ? theme.backgroundSelected
                        : "transparent",
                    },
                  ]}
                  onPress={() => navigateTo(item.route)}
                >
                  <SymbolView
                    name={item.iconName}
                    size={18}
                    tintColor={isActive ? theme.text : theme.textSecondary}
                  />
                  <ThemedText
                    style={{
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? theme.text : theme.textSecondary,
                    }}
                  >
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {__DEV__ && (
            <View style={[styles.simulatorContainer, { borderTopColor: theme.border }]}>
              <ThemedText style={styles.simulatorTitle}>ROLE SIMULATOR</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simulatorChips}>
                {roles.map((r) => {
                  const isSelected = user?.role === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? theme.backgroundSelected : theme.border,
                        },
                      ]}
                      onPress={() => updateRole(r.id as any)}
                    >
                      <ThemedText style={[styles.chipText, { fontWeight: isSelected ? "700" : "400" }]}>
                        {r.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Logout Action */}
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: theme.border }]}
            onPress={() => {
              handleClose();
              logout();
            }}
          >
            <SymbolView
              name={{
                ios: "rectangle.portrait.and.arrow.right",
                android: "logout",
                web: "logout",
              }}
              size={16}
              tintColor={theme.text}
            />
            <ThemedText style={{ fontWeight: "600" }}>Sign Out</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    flex: 1,
  },
  drawerContainerAnimated: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 290,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: Spacing.one,
  },
  profileCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
    marginTop: Spacing.half,
  },
  menuList: {
    flex: 1,
    marginVertical: Spacing.two,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.one,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  simulatorContainer: {
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.two,
  },
  simulatorTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#888",
    marginBottom: Spacing.one,
  },
  simulatorChips: {
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
  },
});
