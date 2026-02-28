import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Platform, Pressable } from "react-native";
import { headerActionTokens } from "../../../shared/config/ui-tokens";
import { resolveHeaderLargeTitle } from "../../../shared/navigation/header-title-policy";
import { resolveStandardStackBackOptions } from "../../../shared/navigation/stack-back-policy";

/**
 * Habitsタブ配下の画面遷移を管理するStack。
 */
export default function HabitsStackLayout() {
  const router = useRouter();
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
          ...resolveStandardStackBackOptions({
            isIos,
            isRootScreen: true,
          }),
          headerLargeTitle: resolveHeaderLargeTitle({
            isIos,
            screenType: "overview",
          }),
          headerRight: () => (
            <Pressable
              accessibilityLabel="Habitを追加"
              accessibilityRole="button"
              className={headerActionTokens.iconButtonClass}
              hitSlop={headerActionTokens.pressableHitSlop}
              onPress={() => {
                router.push("/graphs/create");
              }}
              testID="home-header-create-button"
            >
              <Ionicons name="add" size={headerActionTokens.iconSize} />
            </Pressable>
          ),
          title: "Habits",
        }}
      />
    </Stack>
  );
}
