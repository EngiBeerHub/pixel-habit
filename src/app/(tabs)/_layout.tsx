import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Button } from "heroui-native";

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
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="settings-outline" size={size} />
          ),
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
