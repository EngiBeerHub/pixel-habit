import type { AuthCredentials } from "../storage/auth-storage";

/**
 * 認証状態の判定結果。
 */
export type AuthSessionStatus = "loading" | "authenticated" | "anonymous";

/**
 * アプリ全体で共有する認証セッションの公開インターフェース。
 */
export interface AuthSessionValue {
  clearAuthSession: () => Promise<void>;
  credentials: AuthCredentials | null;
  hasLoadError: boolean;
  refreshAuthSession: () => Promise<void>;
  setAuthSession: (credentials: AuthCredentials) => Promise<void>;
  status: AuthSessionStatus;
}
