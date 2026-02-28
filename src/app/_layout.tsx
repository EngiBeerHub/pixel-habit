import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthSessionProvider } from "../shared/auth/auth-session-context";
import { resolveHeaderLargeTitle } from "../shared/navigation/header-title-policy";
import { resolveStandardStackBackOptions } from "../shared/navigation/stack-back-policy";
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
  const isIos = Platform.OS === "ios";

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
                <Stack.Screen name="auth/index" />
                <Stack.Screen
                  name="graphs/create"
                  options={{
                    ...resolveStandardStackBackOptions({
                      isIos,
                      isRootScreen: false,
                    }),
                    headerLargeTitle: resolveHeaderLargeTitle({
                      isIos,
                      screenType: "form",
                    }),
                    headerShadowVisible: false,
                    headerShown: true,
                    title: "グラフ作成",
                  }}
                />
                <Stack.Screen
                  name="graphs/[graphId]/index"
                  options={{
                    ...resolveStandardStackBackOptions({
                      isIos,
                      isRootScreen: false,
                    }),
                    headerLargeTitle: resolveHeaderLargeTitle({
                      isIos,
                      screenType: "detail",
                    }),
                    headerShadowVisible: false,
                    headerShown: true,
                    title: "グラフ詳細",
                  }}
                />
                <Stack.Screen
                  name="graphs/[graphId]/edit"
                  options={{
                    ...resolveStandardStackBackOptions({
                      isIos,
                      isRootScreen: false,
                    }),
                    headerLargeTitle: resolveHeaderLargeTitle({
                      isIos,
                      screenType: "form",
                    }),
                    headerShadowVisible: false,
                    headerShown: true,
                    title: "グラフ編集",
                  }}
                />
                <Stack.Screen
                  name="graphs/[graphId]/pixels/[date]"
                  options={{
                    ...resolveStandardStackBackOptions({
                      isIos,
                      isRootScreen: false,
                    }),
                    headerLargeTitle: resolveHeaderLargeTitle({
                      isIos,
                      screenType: "form",
                    }),
                    headerShadowVisible: false,
                    headerShown: true,
                    title: "記録編集",
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
