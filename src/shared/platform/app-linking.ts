import { Linking } from "react-native";

/**
 * 外部URLを開けるか判定する。
 */
export const canOpenExternalUrl = (url: string): Promise<boolean> => {
  return Linking.canOpenURL(url);
};

/**
 * 外部URLを開く。
 */
export const openExternalUrl = (url: string): Promise<void> => {
  return Linking.openURL(url);
};
