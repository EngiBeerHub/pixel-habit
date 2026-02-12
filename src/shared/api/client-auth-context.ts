import type { AuthCredentials } from "../storage/auth-storage";

let apiAuthCredentials: AuthCredentials | null = null;

/**
 * APIクライアント層で参照する認証情報を設定する。
 */
export const setApiAuthCredentials = (credentials: AuthCredentials): void => {
  apiAuthCredentials = credentials;
};

/**
 * APIクライアント層で参照する認証情報を取得する。
 */
export const getApiAuthCredentials = (): AuthCredentials | null => {
  return apiAuthCredentials;
};

/**
 * APIクライアント層で参照する認証情報を破棄する。
 */
export const clearApiAuthCredentials = (): void => {
  apiAuthCredentials = null;
};
