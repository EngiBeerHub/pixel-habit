import type { AppOwnership } from "expo-constants";

interface ResolveNativeMenuAvailabilityInput {
  appOwnership: AppOwnership | null;
  platform: string;
}

/**
 * 実行環境に応じてネイティブメニュー可否を解決する。
 */
export const resolveNativeMenuAvailability = ({
  appOwnership,
  platform,
}: ResolveNativeMenuAvailabilityInput): boolean => {
  if (platform !== "ios" && platform !== "android") {
    return false;
  }

  // Expo Go は @react-native-menu/menu のネイティブ機能が利用できない。
  if (appOwnership === "expo") {
    return false;
  }

  return true;
};
