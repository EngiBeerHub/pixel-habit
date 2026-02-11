import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const USERNAME_KEY = "pixela.username";
const TOKEN_KEY = "pixela.token";

/**
 * Pixela 接続に必要な認証情報。
 */
export interface AuthCredentials {
  token: string;
  username: string;
}

/**
 * 認証情報を Secure Store に保存する。
 */
export const saveAuthCredentials = async (
  credentials: AuthCredentials
): Promise<void> => {
  await setItemAsync(USERNAME_KEY, credentials.username);
  await setItemAsync(TOKEN_KEY, credentials.token);
};

/**
 * 保存済みの認証情報を読み込み、両方そろっている場合のみ返す。
 */
export const loadAuthCredentials =
  async (): Promise<AuthCredentials | null> => {
    const [username, token] = await Promise.all([
      getItemAsync(USERNAME_KEY),
      getItemAsync(TOKEN_KEY),
    ]);

    if (!(username && token)) {
      return null;
    }

    return { token, username };
  };

/**
 * 保存済みの認証情報を削除する。
 */
export const clearAuthCredentials = async (): Promise<void> => {
  await Promise.all([
    deleteItemAsync(USERNAME_KEY),
    deleteItemAsync(TOKEN_KEY),
  ]);
};
