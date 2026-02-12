import { useQueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useEffect, useMemo } from "react";
import {
  clearApiAuthCredentials,
  setApiAuthCredentials,
} from "../api/client-auth-context";
import {
  type AuthCredentials,
  clearAuthCredentials,
  saveAuthCredentials,
} from "../storage/auth-storage";
import type { AuthSessionStatus, AuthSessionValue } from "./auth-session-types";
import { useAuthCredentialsQuery } from "./use-auth-credentials-query";

/**
 * AuthSession の共有コンテキスト。
 */
export const AuthSessionContext = createContext<AuthSessionValue | null>(null);

/**
 * 認証情報をアプリ全体で共有するProvider。
 */
export const AuthSessionProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const authQuery = useAuthCredentialsQuery();

  useEffect(() => {
    if (authQuery.data) {
      setApiAuthCredentials(authQuery.data);
      return;
    }
    clearApiAuthCredentials();
  }, [authQuery.data]);

  /**
   * 認証情報キャッシュを更新する。
   */
  const refreshAuthSession = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["authCredentials"],
    });
    await queryClient.refetchQueries({
      queryKey: ["authCredentials"],
      type: "active",
    });
  }, [queryClient]);

  /**
   * 認証情報を保存してキャッシュを同期する。
   */
  const setAuthSession = useCallback(
    async (credentials: AuthCredentials) => {
      await saveAuthCredentials(credentials);
      await refreshAuthSession();
    },
    [refreshAuthSession]
  );

  /**
   * 認証情報を削除してキャッシュを同期する。
   */
  const clearAuthSession = useCallback(async () => {
    await clearAuthCredentials();
    await refreshAuthSession();
  }, [refreshAuthSession]);

  const status: AuthSessionStatus = useMemo(() => {
    if (authQuery.isPending) {
      return "loading";
    }
    if (authQuery.data) {
      return "authenticated";
    }
    return "anonymous";
  }, [authQuery.data, authQuery.isPending]);

  const value = useMemo<AuthSessionValue>(() => {
    return {
      clearAuthSession,
      credentials: authQuery.data ?? null,
      hasLoadError: authQuery.isError,
      refreshAuthSession,
      setAuthSession,
      status,
    };
  }, [
    clearAuthSession,
    authQuery.data,
    authQuery.isError,
    refreshAuthSession,
    setAuthSession,
    status,
  ]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};
