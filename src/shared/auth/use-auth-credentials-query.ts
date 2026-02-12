import { useQuery } from "@tanstack/react-query";
import { loadAuthCredentials } from "../storage/auth-storage";

/**
 * AuthSession 層で利用する認証情報取得Query hook。
 */
export const useAuthCredentialsQuery = () => {
  return useQuery({
    queryFn: loadAuthCredentials,
    queryKey: ["authCredentials"],
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
};
