import { useMutation } from "@tanstack/react-query";
import { pixelaRequest } from "../../shared/api/client";
import type { AuthCredentials } from "../../shared/storage/auth-storage";

/**
 * ログイン処理で必要な入力値。
 */
interface SignInInput {
  token: string;
  username: string;
}

/**
 * ログイン時の資格情報検証と保存を担当する。
 */
export const useSignIn = () => {
  return useMutation({
    mutationFn: async (values: SignInInput) => {
      const credentials: AuthCredentials = {
        token: values.token.trim(),
        username: values.username.trim(),
      };
      await pixelaRequest({
        method: "GET",
        path: `/v1/users/${credentials.username}/graphs`,
        token: credentials.token,
      });
      return credentials;
    },
  });
};
