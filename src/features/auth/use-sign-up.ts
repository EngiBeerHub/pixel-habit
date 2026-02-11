import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../shared/api/user";
import {
  type AuthCredentials,
  saveAuthCredentials,
} from "../../shared/storage/auth-storage";

/**
 * アカウント作成処理で必要な入力値。
 */
interface SignUpInput {
  token: string;
  username: string;
}

/**
 * アカウント作成と資格情報保存を担当する。
 */
export const useSignUp = () => {
  return useMutation({
    mutationFn: async (values: SignUpInput) => {
      const credentials: AuthCredentials = {
        token: values.token.trim(),
        username: values.username.trim(),
      };
      await createUser({
        token: credentials.token,
        username: credentials.username,
      });
      await saveAuthCredentials(credentials);
      return credentials;
    },
  });
};
