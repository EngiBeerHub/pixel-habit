/**
 * サーフェス（面）に関する意味トークン。
 */
export const surfaceTokens = {
  accentSubtleClass: "bg-neutral-100",
  cardClass: "bg-white",
  dangerSubtleClass: "bg-red-50",
  mutedClass: "bg-neutral-50",
  screenClass: "bg-white",
  successSubtleClass: "bg-green-50",
  warningSubtleClass: "bg-amber-50",
} as const;

/**
 * 枠線に関する意味トークン。
 */
export const borderTokens = {
  dangerClass: "border-red-200",
  defaultClass: "border-neutral-200",
  strongClass: "border-neutral-300",
  successClass: "border-green-200",
  warningClass: "border-amber-200",
} as const;

/**
 * テキスト色に関する意味トークン。
 */
export const textTokens = {
  dangerClass: "text-red-700",
  inverseClass: "text-white",
  mutedClass: "text-neutral-500",
  primaryClass: "text-neutral-900",
  secondaryClass: "text-neutral-600",
  successClass: "text-green-700",
  tertiaryClass: "text-neutral-800",
  warningClass: "text-amber-900",
  warningEmphasisClass: "text-amber-800",
  warningSubtleClass: "text-amber-700",
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
  bodyClass: "text-neutral-600",
  headingClass: "font-bold text-2xl text-neutral-900",
  sectionTitleClass: "font-semibold text-lg text-neutral-900",
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
