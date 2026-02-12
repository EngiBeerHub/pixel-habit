import { useContext } from "react";
import { AuthSessionContext } from "./auth-session-context";

/**
 * 認証セッションへアクセスする共通hook。
 */
export const useAuthSession = () => {
  const value = useContext(AuthSessionContext);
  if (!value) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return value;
};
