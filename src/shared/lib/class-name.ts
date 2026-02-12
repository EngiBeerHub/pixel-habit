import { twMerge } from "tailwind-merge";

/**
 * className文字列を空値除外して結合し、Tailwindクラス競合を解決する。
 */
export const mergeClassNames = (
  ...classNames: Array<string | undefined>
): string => {
  return twMerge(classNames.filter(Boolean).join(" "));
};
