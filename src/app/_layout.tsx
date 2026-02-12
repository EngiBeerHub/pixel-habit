import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthSessionProvider } from "../shared/auth/auth-session-context";

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
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <HeroUINativeProvider config={config}>
            <Slot />
            <StatusBar style="dark" />
          </HeroUINativeProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
