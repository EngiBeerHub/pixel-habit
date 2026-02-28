export type HeaderTitleScreenType = "detail" | "form" | "overview";

interface ResolveHeaderLargeTitleInput {
  isIos: boolean;
  screenType: HeaderTitleScreenType;
}

/**
 * 画面種別に応じた Large Title 表示可否を解決する。
 */
export const resolveHeaderLargeTitle = ({
  isIos,
  screenType,
}: ResolveHeaderLargeTitleInput): boolean => {
  if (!isIos) {
    return false;
  }

  return screenType === "overview" || screenType === "detail";
};
