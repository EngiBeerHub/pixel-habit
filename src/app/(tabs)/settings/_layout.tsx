import { Stack } from "expo-router";

/**
 * Settings配下の画面遷移を管理するStack。
 */
export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="token"
        options={{
          title: "トークン変更",
        }}
      />
    </Stack>
  );
}
