import { useEffect, useCallback, useState } from "react";
import * as Updates from "expo-updates";
import { Alert, AppState } from "react-native";

type UpdateStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "error"
  | "no-update";

/**
 * Hook to manage OTA updates from the Cloudflare R2 backend.
 *
 * Features:
 * - Automatically checks for updates when the app comes to the foreground
 * - Provides manual check/apply functions
 * - Shows an alert when an update is ready to restart
 *
 * Usage:
 *   const { status, checkForUpdate, lastChecked } = useOTAUpdate();
 */
export function useOTAUpdate() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkForUpdate = useCallback(async () => {
    // In development, expo-updates is not available
    if (__DEV__) {
      console.log("[OTA] Skipping update check in development mode");
      return;
    }

    try {
      setStatus("checking");

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setStatus("downloading");
        await Updates.fetchUpdateAsync();
        setStatus("ready");

        // Prompt user to restart and apply the update
        Alert.alert(
          "Update Available 🎉",
          "A new version has been downloaded. Restart the app to apply the update.",
          [
            {
              text: "Later",
              style: "cancel",
              onPress: () => setStatus("idle"),
            },
            {
              text: "Restart Now",
              style: "default",
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ],
        );
      } else {
        setStatus("no-update");
      }

      setLastChecked(new Date());
    } catch (error: any) {
      console.error("[OTA] Error checking for update:", error);
      setStatus("error");
      Alert.alert("OTA Error", error?.message || "Unknown error");
    }
  }, []);

  // Auto-check when app comes to foreground
  useEffect(() => {
    if (__DEV__) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkForUpdate();
      }
    });

    // Also check on mount
    checkForUpdate();

    return () => {
      subscription.remove();
    };
  }, [checkForUpdate]);

  return {
    status,
    checkForUpdate,
    lastChecked,
    isChecking: status === "checking",
    isDownloading: status === "downloading",
    isReady: status === "ready",
  };
}
