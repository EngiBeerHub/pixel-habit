import { useMutation } from "@tanstack/react-query";
import { getGraphs } from "../../shared/api/graph";
import {
  type AuthCredentials,
  saveAuthCredentials,
} from "../../shared/storage/auth-storage";

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
      await getGraphs({
        token: credentials.token,
        username: credentials.username,
      });
      await saveAuthCredentials(credentials);
      return credentials;
    },
  });
};
