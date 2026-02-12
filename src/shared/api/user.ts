import { AuthRequiredError, pixelaRequest } from "./client";
import { getApiAuthCredentials } from "./client-auth-context";

/**
 * ユーザー作成APIのリクエストパラメータ。
 */
interface CreateUserParams {
  token: string;
  username: string;
}

/**
 * トークン更新APIのリクエストパラメータ。
 */
interface UpdateUserTokenParams {
  newToken: string;
}

/**
 * Pixela API の成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * Pixelaユーザーを新規作成する。
 */
export const createUser = ({
  token,
  username,
}: CreateUserParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    body: {
      agreeTermsOfService: "yes",
      notMinor: "yes",
      token,
      username,
    },
    method: "POST",
    path: "/v1/users",
  });
};

/**
 * 指定ユーザーのトークンを更新する。
 */
export const updateUserToken = ({
  newToken,
}: UpdateUserTokenParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    body: {
      newToken,
    },
    method: "PUT",
    path: `/v1/users/${username}`,
  });
};

/**
 * 指定ユーザーを削除する。
 */
export const deleteUser = (): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}`,
  });
};

/**
 * 認証コンテキストから現在のusernameを取得する。
 */
const getRequiredUsername = (): string => {
  const credentials = getApiAuthCredentials();
  if (!credentials) {
    throw new AuthRequiredError();
  }
  return credentials.username;
};
