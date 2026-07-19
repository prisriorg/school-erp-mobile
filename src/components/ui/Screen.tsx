import { ScrollView, StyleSheet, View, RefreshControl, ScrollViewProps, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedView } from "../themed-view";
import { Spacing } from "@/constants/theme";

interface ScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollable?: boolean;
  padded?: boolean;
}

export function Screen({ 
  children, 
  refreshing = false, 
  onRefresh, 
  scrollable = true,
  padded = true,
  contentContainerStyle,
  ...props 
}: ScreenProps) {
  const theme = useTheme();

  const content = (
    <View style={[styles.container, padded && { padding: Spacing.four }]}>
      {children}
    </View>
  );

  return (
    <ThemedView style={styles.wrapper}>
      <KeyboardAvoidingView 
        style={styles.wrapper} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle as any]}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
              ) : undefined
            }
            {...props}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.wrapper, contentContainerStyle as any]}>
            {content}
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  container: {
    flex: 1,
  }
});
