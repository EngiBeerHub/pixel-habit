/**
 * Expo Router で利用する主要ルート定義。
 *
 * 画面間で同じパス文字列を重複させないために集約する。
 */
export const appRoutes = {
  authHub: "/auth/index",
  homeTab: "/(tabs)/home",
  settingsToken: "/settings/token",
} as const;
