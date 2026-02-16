import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

/**
 * Home / Settings の2タブレイアウト。
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeTintColor = colorScheme === "dark" ? "#38bdf8" : "#0f766e";
  const inactiveTintColor = colorScheme === "dark" ? "#9ca3af" : "#737373";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="grid-outline" size={size} />
          ),
          title: "Habits",
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
