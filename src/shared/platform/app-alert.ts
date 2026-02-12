import { Alert } from "react-native";

/**
 * React Native Alert を薄くラップしてテスト時のモックポイントを統一する。
 */
export const showAlert = (...args: Parameters<typeof Alert.alert>): void => {
  Alert.alert(...args);
};
