/**
 * optionalData(JSON文字列)のキー名。
 */
const OPTIONAL_DATA_MEMO_KEY = "memo";

/**
 * optionalData入力をAPI送信向けJSON文字列へ変換する。
 */
export const serializeOptionalData = (
  optionalData: string | undefined
): string | undefined => {
  if (!optionalData) {
    return undefined;
  }

  const trimmed = optionalData.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return JSON.stringify({ [OPTIONAL_DATA_MEMO_KEY]: trimmed });
};

/**
 * APIのoptionalData文字列を画面表示用メモ文字列へ復元する。
 */
export const deserializeOptionalData = (
  optionalData: string | undefined
): string | undefined => {
  if (!optionalData) {
    return undefined;
  }

  const trimmed = optionalData.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      OPTIONAL_DATA_MEMO_KEY in parsed &&
      typeof parsed[OPTIONAL_DATA_MEMO_KEY] === "string"
    ) {
      const normalizedMemo = parsed[OPTIONAL_DATA_MEMO_KEY].trim();
      return normalizedMemo || undefined;
    }
  } catch {
    // 後方互換: 非JSON保存値はそのまま表示する
  }

  return trimmed;
};

/**
 * 一覧表示向けにメモを1行要約へ変換する。
 */
export const toOptionalMemoPreview = (
  optionalData: string | undefined,
  maxLength: number
): string | null => {
  if (!optionalData) {
    return null;
  }

  const normalized = optionalData.replaceAll(/\s+/g, " ").trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}…`;
};
