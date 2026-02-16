import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useColorScheme } from "react-native";

/**
 * Home / Settings の2タブレイアウト。
 */
export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const activeTintColor = colorScheme === "dark" ? "#38bdf8" : "#0f766e";
  const inactiveTintColor = colorScheme === "dark" ? "#9ca3af" : "#737373";

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerShown: true,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerRight: () => (
            <Button
              accessibilityLabel="グラフ追加"
              isIconOnly
              onPress={() => {
                router.push("/graphs/create");
              }}
              size="sm"
              testID="home-header-create-button"
              variant="ghost"
            >
              <Ionicons name="add" size={18} />
            </Button>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home" size={size} />
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="settings-outline" size={size} />
          ),
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
