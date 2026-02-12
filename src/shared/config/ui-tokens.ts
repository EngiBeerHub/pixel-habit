/**
 * 画面共通の色トーンを表すクラス定義。
 */
export const colorTokens = {
  dangerBackgroundClass: "bg-red-50",
  dangerBorderClass: "border-red-200",
  dangerTextClass: "text-red-700",
  dividerBorderClass: "border-neutral-200",
  infoTextClass: "text-neutral-600",
  screenBackgroundClass: "bg-white",
  sectionBackgroundClass: "bg-white",
  sectionBorderClass: "border-neutral-200",
  successBackgroundClass: "bg-green-50",
  successBorderClass: "border-green-200",
  successTextClass: "text-green-700",
  textPrimaryClass: "text-neutral-900",
  textSecondaryClass: "text-neutral-600",
  textTertiaryClass: "text-neutral-800",
} as const;

/**
 * 余白に関する共通トークン。
 */
export const spacingTokens = {
  formFieldErrorMinHeightClass: "min-h-5",
  screenHorizontalClass: "px-6",
  screenPaddingBottomClass: "pb-6",
  screenPaddingTopClass: "pt-16",
  sectionGapClass: "gap-3",
  sectionMarginBottomClass: "mb-6",
  sectionPaddingClass: "p-4",
} as const;

/**
 * 角丸に関する共通トークン。
 */
export const radiusTokens = {
  sectionRadiusClass: "rounded-xl",
} as const;

/**
 * タイポグラフィに関する共通トークン。
 */
export const typographyTokens = {
  bodyClass: "text-neutral-600",
  headingClass: "font-bold text-2xl text-neutral-900",
  sectionTitleClass: "font-semibold text-lg text-neutral-900",
} as const;

/**
 * Compactヒートマップ専用のサイズトークン。
 */
export const heatmapTokens = {
  cellGap: 3,
  cellSize: 16,
  emptyColor: "#f3f4f6",
  labelWidth: 24,
} as const;

/**
 * 共通UIトークンの型。
 */
export interface UiTokens {
  colorTokens: typeof colorTokens;
  heatmapTokens: typeof heatmapTokens;
  radiusTokens: typeof radiusTokens;
  spacingTokens: typeof spacingTokens;
  typographyTokens: typeof typographyTokens;
}
