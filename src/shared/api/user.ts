import { pixelaRequest } from "./client";

/**
 * トークン更新APIのリクエストパラメータ。
 */
interface UpdateUserTokenParams {
  newToken: string;
  token: string;
  username: string;
}

/**
 * ユーザー削除APIのリクエストパラメータ。
 */
interface DeleteUserParams {
  token: string;
  username: string;
}

/**
 * Pixela API の成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * 指定ユーザーのトークンを更新する。
 */
export const updateUserToken = ({
  newToken,
  token,
  username,
}: UpdateUserTokenParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    body: {
      newToken,
    },
    method: "PUT",
    path: `/v1/users/${username}`,
    token,
  });
};

/**
 * 指定ユーザーを削除する。
 */
export const deleteUser = ({
  token,
  username,
}: DeleteUserParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}`,
    token,
  });
};
