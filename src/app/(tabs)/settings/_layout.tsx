import { Stack } from "expo-router";
import { Platform } from "react-native";

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
          headerLargeTitle: isIos,
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="token"
        options={{
          headerLargeTitle: false,
          title: "トークン変更",
        }}
      />
    </Stack>
  );
}
