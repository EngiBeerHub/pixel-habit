import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthSessionProvider } from "../shared/auth/auth-session-context";
import { AppDialogProvider } from "../shared/ui/app-dialog-provider";

/**
 * HeroUI Native の開発時設定。
 */
const config: HeroUINativeConfig = {
  devInfo: {
    // スタイリング指針の案内表示を無効化する
    stylingPrinciples: false,
  },
};

/**
 * アプリ全体で共有する React Query クライアント。
 */
const queryClient = new QueryClient();

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <HeroUINativeProvider config={config}>
            <AppDialogProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
                <Stack.Screen
                  name="graphs"
                  options={{
                    animation: "slide_from_right",
                  }}
                />
              </Stack>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </AppDialogProvider>
          </HeroUINativeProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
