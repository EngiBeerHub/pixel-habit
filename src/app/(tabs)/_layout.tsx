import { Tabs, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

/**
 * Home / Settings の2タブレイアウト。
 */
export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerShown: true,
        tabBarActiveTintColor: "#0f766e",
        tabBarInactiveTintColor: "#737373",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerRight: () => (
            <Pressable
              className="rounded-full px-3 py-1"
              onPress={() => {
                router.push("/graphs/create");
              }}
              testID="home-header-create-button"
            >
              <Text className="font-medium text-blue-500 text-sm">
                グラフ追加
              </Text>
            </Pressable>
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
