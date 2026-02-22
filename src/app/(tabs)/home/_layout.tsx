import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Platform, Pressable } from "react-native";

/**
 * Habitsタブ配下の画面遷移を管理するStack。
 */
export default function HabitsStackLayout() {
  const router = useRouter();
  const isIos = Platform.OS === "ios";

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: isIos,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => (
            <Pressable
              accessibilityLabel="Habitを追加"
              accessibilityRole="button"
              className="w-9 items-center justify-center"
              hitSlop={8}
              onPress={() => {
                router.push("/graphs/create");
              }}
              testID="home-header-create-button"
            >
              <Ionicons name="add" size={24} />
            </Pressable>
          ),
          title: "Habits",
        }}
      />
    </Stack>
  );
}
