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
            戻る
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
