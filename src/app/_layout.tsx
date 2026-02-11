import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const config: HeroUINativeConfig = {
  devInfo: {
    // スタイリング指針の案内表示を無効化する
    stylingPrinciples: false,
  },
};

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider config={config}>
          <Slot />
          <StatusBar style="dark" />
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
