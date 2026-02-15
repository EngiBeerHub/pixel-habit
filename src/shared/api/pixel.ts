import { AuthRequiredError, pixelaRequest } from "./client";
import { getApiAuthCredentials } from "./client-auth-context";

/**
 * 日次記録追加APIのリクエストパラメータ。
 */
interface AddPixelParams {
  date: string;
  graphId: string;
  optionalData?: string;
  quantity: string;
}

/**
 * ピクセル一覧取得APIのパラメータ。
 */
interface GetPixelsParams {
  from?: string;
  graphId: string;
  to?: string;
}

/**
 * ピクセル更新APIのパラメータ。
 */
interface UpdatePixelParams {
  date: string;
  graphId: string;
  optionalData?: string;
  quantity: string;
}

/**
 * ピクセル削除APIのパラメータ。
 */
interface DeletePixelParams {
  date: string;
  graphId: string;
}

/**
 * Pixelaの成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * 単一ピクセルのデータ形式。
 */
export interface Pixel {
  date: string;
  optionalData?: string;
  quantity: string;
}

/**
 * ピクセル一覧APIレスポンス。
 */
interface PixelsResponse {
  pixels?: Array<Pixel | string>;
}

/**
 * 指定グラフへ1件のピクセル（日次記録）を追加する。
 */
export const addPixel = ({
  date,
  graphId,
  optionalData,
  quantity,
}: AddPixelParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  const normalizedOptionalData = serializeOptionalData(optionalData);
  return pixelaRequest<SuccessResponse>({
    body: {
      date,
      ...(normalizedOptionalData
        ? { optionalData: normalizedOptionalData }
        : {}),
      quantity,
    },
    method: "POST",
    path: `/v1/users/${username}/graphs/${graphId}`,
  });
};

/**
 * 指定グラフのピクセル一覧を取得する。
 */
export const getPixels = async ({
  from,
  graphId,
  to,
}: GetPixelsParams): Promise<Pixel[]> => {
  const username = getRequiredUsername();
  const searchParams = new URLSearchParams({
    withBody: "true",
  });
  if (from) {
    searchParams.set("from", from);
  }
  if (to) {
    searchParams.set("to", to);
  }

  const response = await pixelaRequest<PixelsResponse>({
    method: "GET",
    path: `/v1/users/${username}/graphs/${graphId}/pixels?${searchParams.toString()}`,
  });
  if (!response.pixels) {
    return [];
  }
  return normalizePixels(response.pixels);
};

/**
 * 指定日付のピクセルを更新（upsert）する。
 */
export const updatePixel = ({
  date,
  graphId,
  optionalData,
  quantity,
}: UpdatePixelParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  const normalizedOptionalData = serializeOptionalData(optionalData);
  return pixelaRequest<SuccessResponse>({
    body: {
      ...(normalizedOptionalData
        ? { optionalData: normalizedOptionalData }
        : {}),
      quantity,
    },
    method: "PUT",
    path: `/v1/users/${username}/graphs/${graphId}/${date}`,
  });
};

/**
 * 指定日付のピクセルを削除する。
 */
export const deletePixel = ({
  date,
  graphId,
}: DeletePixelParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}/graphs/${graphId}/${date}`,
  });
};

/**
 * APIの揺らぎ（文字列配列/オブジェクト配列）をPixel配列へ正規化する。
 */
const normalizePixels = (pixels: Array<Pixel | string>): Pixel[] => {
  const normalized: Pixel[] = [];
  for (const pixel of pixels) {
    if (typeof pixel === "string") {
      normalized.push({
        date: pixel,
        quantity: "",
      });
      continue;
    }
    normalized.push({
      ...pixel,
      optionalData: deserializeOptionalData(pixel.optionalData),
    });
  }
  return normalized;
};

/**
 * optionalData入力をAPI送信向けJSON文字列へ変換する。
 */
const serializeOptionalData = (
  optionalData: string | undefined
): string | undefined => {
  if (!optionalData) {
    return undefined;
  }
  const trimmed = optionalData.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return JSON.stringify({ memo: trimmed });
};

/**
 * APIのoptionalData文字列を画面表示用メモ文字列へ復元する。
 */
const deserializeOptionalData = (
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
      "memo" in parsed &&
      typeof parsed.memo === "string"
    ) {
      const normalizedMemo = parsed.memo.trim();
      return normalizedMemo || undefined;
    }
  } catch {
    // 既存データ互換: 非JSONで保存された値はそのままメモとして扱う
  }

  return trimmed;
};

/**
 * 認証コンテキストから現在のusernameを取得する。
 */
const getRequiredUsername = (): string => {
  const credentials = getApiAuthCredentials();
  if (!credentials) {
    throw new AuthRequiredError();
  }
  return credentials.username;
};
