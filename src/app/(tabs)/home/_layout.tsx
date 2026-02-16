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
          headerRight: ({ tintColor }) => (
            <Pressable
              accessibilityLabel="Habitを追加"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                router.push("/graphs/create");
              }}
              style={({ pressed }) => ({
                alignItems: "center",
                height: 44,
                justifyContent: "center",
                opacity: pressed ? 0.55 : 1,
                width: 44,
              })}
              testID="home-header-create-button"
            >
              <Ionicons color={tintColor} name="add-sharp" size={24} />
            </Pressable>
          ),
          title: "Habits",
        }}
      />
    </Stack>
  );
}
