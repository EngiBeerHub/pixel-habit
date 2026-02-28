import { Stack } from "expo-router";
import { Platform } from "react-native";
import { resolveHeaderLargeTitle } from "../../../shared/navigation/header-title-policy";

/**
 * Settings配下の画面遷移を管理するStack。
 */
export default function SettingsStackLayout() {
  const isIos = Platform.OS === "ios";

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: resolveHeaderLargeTitle({
            isIos,
            screenType: "overview",
          }),
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="token"
        options={{
          headerLargeTitle: resolveHeaderLargeTitle({
            isIos,
            screenType: "form",
          }),
          title: "トークン変更",
        }}
      />
    </Stack>
  );
}
