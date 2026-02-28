import type { appRoutes } from "../config/routes";

interface RecoverableDialogAction {
  label: string;
  onPress?: () => void;
  role?: "cancel" | "default" | "destructive";
}

interface RecoverableDialogParams {
  actions: RecoverableDialogAction[];
  description?: string;
  title: string;
}

interface NavigateToTabWithRecoveryInput {
  onError?: (error: unknown) => void;
  openDialog: (params: RecoverableDialogParams) => void;
  replace: (href: string) => void;
  targetRoute: (typeof appRoutes)[keyof typeof appRoutes];
}

/**
 * タブ遷移失敗時に現在画面へ留まり、再試行可能な導線を提示する。
 */
export const navigateToTabWithRecovery = ({
  onError,
  openDialog,
  replace,
  targetRoute,
}: NavigateToTabWithRecoveryInput): boolean => {
  const retryNavigation = (): boolean => {
    try {
      replace(targetRoute);
      return true;
    } catch (error) {
      onError?.(error);
      openDialog({
        actions: [
          {
            label: "閉じる",
            role: "cancel",
          },
          {
            label: "再試行",
            onPress: retryNavigation,
          },
        ],
        description:
          "現在の画面に留まりました。時間をおいて再試行してください。",
        title: "タブの切り替えに失敗しました",
      });
      return false;
    }
  };

  return retryNavigation();
};
