/**
 * サーフェス（面）に関する意味トークン。
 */
export const surfaceTokens = {
  accentSubtleClass: "bg-neutral-100 dark:bg-neutral-800",
  cardClass: "bg-white dark:bg-neutral-900",
  dangerSubtleClass: "bg-red-50 dark:bg-red-950/40",
  mutedClass: "bg-neutral-50 dark:bg-neutral-900",
  screenClass: "bg-white dark:bg-neutral-950",
  successSubtleClass: "bg-green-50 dark:bg-green-950/40",
  warningSubtleClass: "bg-amber-50 dark:bg-amber-950/40",
} as const;

/**
 * 枠線に関する意味トークン。
 */
export const borderTokens = {
  dangerClass: "border-red-200 dark:border-red-800",
  defaultClass: "border-neutral-200 dark:border-neutral-800",
  strongClass: "border-neutral-300 dark:border-neutral-700",
  successClass: "border-green-200 dark:border-green-800",
  warningClass: "border-amber-200 dark:border-amber-800",
} as const;

/**
 * テキスト色に関する意味トークン。
 */
export const textTokens = {
  dangerClass: "text-red-700 dark:text-red-300",
  inverseClass: "text-white",
  mutedClass: "text-neutral-500 dark:text-neutral-400",
  primaryClass: "text-neutral-900 dark:text-neutral-50",
  secondaryClass: "text-neutral-600 dark:text-neutral-300",
  successClass: "text-green-700 dark:text-green-300",
  tertiaryClass: "text-neutral-800 dark:text-neutral-100",
  warningClass: "text-amber-900 dark:text-amber-200",
  warningEmphasisClass: "text-amber-800 dark:text-amber-200",
  warningSubtleClass: "text-amber-700 dark:text-amber-300",
} as const;

/**
 * 余白に関する共通トークン。
 */
export const spacingTokens = {
  cardContentClass: "p-4",
  cardGapClass: "gap-3",
  formFieldErrorMinHeightClass: "min-h-5",
  listHeaderGapClass: "gap-3",
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
  chipRadiusClass: "rounded-full",
  sectionRadiusClass: "rounded-xl",
} as const;

/**
 * タイポグラフィに関する共通トークン。
 */
export const typographyTokens = {
  bodyClass: "text-neutral-600 dark:text-neutral-300",
  headingClass: "font-bold text-2xl text-neutral-900 dark:text-neutral-50",
  sectionTitleClass:
    "font-semibold text-lg text-neutral-900 dark:text-neutral-50",
} as const;

/**
 * 後方互換のために残す旧色トークン。
 */
export const colorTokens = {
  dangerBackgroundClass: surfaceTokens.dangerSubtleClass,
  dangerBorderClass: borderTokens.dangerClass,
  dangerTextClass: textTokens.dangerClass,
  dividerBorderClass: borderTokens.defaultClass,
  infoTextClass: textTokens.secondaryClass,
  screenBackgroundClass: surfaceTokens.screenClass,
  sectionBackgroundClass: surfaceTokens.cardClass,
  sectionBorderClass: borderTokens.defaultClass,
  successBackgroundClass: surfaceTokens.successSubtleClass,
  successBorderClass: borderTokens.successClass,
  successTextClass: textTokens.successClass,
  textPrimaryClass: textTokens.primaryClass,
  textSecondaryClass: textTokens.secondaryClass,
  textTertiaryClass: textTokens.tertiaryClass,
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
  borderTokens: typeof borderTokens;
  colorTokens: typeof colorTokens;
  heatmapTokens: typeof heatmapTokens;
  radiusTokens: typeof radiusTokens;
  surfaceTokens: typeof surfaceTokens;
  spacingTokens: typeof spacingTokens;
  textTokens: typeof textTokens;
  typographyTokens: typeof typographyTokens;
}
