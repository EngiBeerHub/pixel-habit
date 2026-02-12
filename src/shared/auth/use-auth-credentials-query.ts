import { useQuery } from "@tanstack/react-query";
import { loadAuthCredentials } from "../storage/auth-storage";

/**
 * 保存済み認証情報を取得する共通Query hook。
 */
export const useAuthCredentialsQuery = () => {
  return useQuery({
    queryFn: loadAuthCredentials,
    queryKey: ["authCredentials"],
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
};
