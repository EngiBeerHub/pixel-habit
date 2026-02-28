import { appRoutes } from "../config/routes";
import { navigateToTabWithRecovery } from "./tab-navigation-fallback";

describe("navigateToTabWithRecovery", () => {
  test("navigates to the target tab when replace succeeds", () => {
    const replace = jest.fn();
    const openDialog = jest.fn();

    const result = navigateToTabWithRecovery({
      openDialog,
      replace,
      targetRoute: appRoutes.homeTab,
    });

    expect(result).toBe(true);
    expect(replace).toHaveBeenCalledWith(appRoutes.homeTab);
    expect(openDialog).not.toHaveBeenCalled();
  });

  test("stays on current screen and shows retry dialog when replace throws", () => {
    const replace = jest.fn(() => {
      throw new Error("navigation failed");
    });
    const openDialog = jest.fn();

    const result = navigateToTabWithRecovery({
      openDialog,
      replace,
      targetRoute: appRoutes.homeTab,
    });

    expect(result).toBe(false);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(openDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "タブの切り替えに失敗しました",
      })
    );
    const dialogInput = openDialog.mock.calls[0]?.[0] as {
      actions: { label: string; onPress?: () => void }[];
      description?: string;
    };
    expect(dialogInput.description).toContain("再試行");
    expect(dialogInput.actions).toHaveLength(2);
    expect(dialogInput.actions[1]?.label).toBe("再試行");

    dialogInput.actions[1]?.onPress?.();
    expect(replace).toHaveBeenCalledTimes(2);
  });
});
