import { pixelaRequest } from "./client";

/**
 * 日次記録追加APIのリクエストパラメータ。
 */
interface AddPixelParams {
  date: string;
  graphId: string;
  quantity: string;
  token: string;
  username: string;
}

/**
 * ピクセル一覧取得APIのパラメータ。
 */
interface GetPixelsParams {
  graphId: string;
  token: string;
  username: string;
}

/**
 * ピクセル更新APIのパラメータ。
 */
interface UpdatePixelParams {
  date: string;
  graphId: string;
  quantity: string;
  token: string;
  username: string;
}

/**
 * ピクセル削除APIのパラメータ。
 */
interface DeletePixelParams {
  date: string;
  graphId: string;
  token: string;
  username: string;
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
  quantity,
  token,
  username,
}: AddPixelParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    body: {
      date,
      quantity,
    },
    method: "POST",
    path: `/v1/users/${username}/graphs/${graphId}`,
    token,
  });
};

/**
 * 指定グラフのピクセル一覧を取得する。
 */
export const getPixels = async ({
  graphId,
  token,
  username,
}: GetPixelsParams): Promise<Pixel[]> => {
  const response = await pixelaRequest<PixelsResponse>({
    method: "GET",
    path: `/v1/users/${username}/graphs/${graphId}/pixels?withBody=true`,
    token,
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
  quantity,
  token,
  username,
}: UpdatePixelParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    body: {
      quantity,
    },
    method: "PUT",
    path: `/v1/users/${username}/graphs/${graphId}/${date}`,
    token,
  });
};

/**
 * 指定日付のピクセルを削除する。
 */
export const deletePixel = ({
  date,
  graphId,
  token,
  username,
}: DeletePixelParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}/graphs/${graphId}/${date}`,
    token,
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
    normalized.push(pixel);
  }
  return normalized;
};
