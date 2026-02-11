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
 * Pixelaの成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
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
