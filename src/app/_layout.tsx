import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  useRouter,
  useSegments,
  Slot,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useColorScheme,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { SymbolView } from "expo-symbols";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { AppDrawer } from "@/components/app-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthStore } from "@/store/authStore";
import { Colors, Spacing } from "@/constants/theme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  const segments = useSegments();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, isInitialized, segments, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={styles.safeArea}>
          <AnimatedSplashOverlay />
          {!user ? (
            <Slot />
          ) : (
            <View style={styles.flexOne}>
              {/* Global Header with Drawer Hamburger Menu */}
              <ThemedView style={styles.topNavbar}>
                <TouchableOpacity
                  style={styles.menuIconBtn}
                  onPress={() => setDrawerOpen(true)}
                >
                  <SymbolView
                    name={{
                      android: "menu",
                      ios: "line.3.horizontal",
                    }}
                    size={28}
                    tintColor={themeColors.text}
                  />
                </TouchableOpacity>

                <ThemedText type="smallBold" style={styles.navBrand}>
                  Academia ERP
                </ThemedText>
              </ThemedView>

              {/* Tab Navigation Content */}
              <AppTabs />

              {/* Side Drawer Menu Modal */}
              <AppDrawer
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              />
            </View>
          )}
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default function TabLayout() {
  return <RootLayoutNav />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  topNavbar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#8882",
    justifyContent: "space-between",
    zIndex: 10,
  },
  menuIconBtn: {
    padding: Spacing.one,
  },
  navBrand: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  yearTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
