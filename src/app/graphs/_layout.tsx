import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Button } from "heroui-native";

/**
 * Graph関連画面のStackレイアウト。
 */
export default function GraphStackLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerLeft: ({ canGoBack }) => (
          <Button
            accessibilityLabel={canGoBack ? "前の画面へ戻る" : "ホームへ戻る"}
            isIconOnly
            onPress={() => {
              if (canGoBack) {
                router.back();
                return;
              }
              router.replace("/(tabs)/home");
            }}
            size="sm"
            variant="ghost"
          >
            <Ionicons name="chevron-back" size={20} />
          </Button>
        ),
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#111827",
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: "グラフ作成",
        }}
      />
      <Stack.Screen
        name="[graphId]/index"
        options={{
          title: "グラフ詳細",
        }}
      />
      <Stack.Screen
        name="[graphId]/edit"
        options={{
          title: "グラフ編集",
        }}
      />
      <Stack.Screen
        name="[graphId]/pixels/[date]"
        options={{
          title: "記録編集",
        }}
      />
    </Stack>
  );
}
