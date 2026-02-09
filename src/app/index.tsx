import { StatusBar } from "expo-status-bar";
import {
  Button,
  type HeroUINativeConfig,
  HeroUINativeProvider,
} from "heroui-native";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const config: HeroUINativeConfig = {
  devInfo: {
    // Disable styling principles information message
    stylingPrinciples: false,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView>
      <HeroUINativeProvider config={config}>
        <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
          {/* Heading */}
          <Text className="mb-3 font-extrabold text-4xl text-gray-800 tracking-tight dark:text-white">
            🚀 Welcome
          </Text>

          {/* Subheading */}
          <Text className="mb-8 text-center text-gray-700 text-xl leading-relaxed dark:text-white">
            Build beautiful apps with{" "}
            <Text className="font-semibold text-blue-500">
              Expo (Router) + Uniwind 🔥
            </Text>
          </Text>

          {/* Instruction text */}
          <Text className="max-w-sm text-center text-base text-gray-600 dark:text-white">
            Start customizing your app by editing{" "}
            <Text className="font-semibold text-gray-800 dark:text-white">
              app/index.tsx
            </Text>
          </Text>

          <Button onPress={() => console.log("Pressed!")}>Get Started</Button>

          <StatusBar style="dark" />
        </View>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
