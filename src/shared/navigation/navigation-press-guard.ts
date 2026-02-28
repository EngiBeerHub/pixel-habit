/**
 * 連打による重複遷移を防ぐための最小間隔（ms）。
 */
const NAVIGATION_GUARD_WINDOW_MS = 500;

/**
 * 短時間の連続実行を抑止し、意図しない重複遷移を防ぐ。
 */
export const createNavigationPressGuard = () => {
  let lastInvokedAt = 0;

  return (action: () => void) => {
    const now = Date.now();
    if (now - lastInvokedAt < NAVIGATION_GUARD_WINDOW_MS) {
      return;
    }
    lastInvokedAt = now;
    action();
  };
};
