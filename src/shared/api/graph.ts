import { pixelaRequest } from "./client";

/**
 * Pixelaで利用できるグラフ色。
 */
export const graphColorOptions = [
  "ajisai",
  "ichou",
  "kuro",
  "momiji",
  "shibafu",
  "sora",
] as const;

/**
 * Pixelaで利用できるグラフ色の型。
 */
export type GraphColor = (typeof graphColorOptions)[number];

/**
 * Pixela のグラフ定義レスポンス。
 */
export interface GraphDefinition {
  color: GraphColor;
  id: string;
  name: string;
  timezone: string;
  unit: string;
}

/**
 * グラフ一覧取得APIのレスポンス形式。
 */
interface GraphListResponse {
  graphs: GraphDefinition[];
}

/**
 * グラフ一覧取得に必要な認証情報。
 */
interface GetGraphsParams {
  token: string;
  username: string;
}

/**
 * グラフ統計レスポンス。
 */
export interface GraphStats {
  avgQuantity?: number;
  maxDate?: string;
  maxQuantity?: number;
  minDate?: string;
  minQuantity?: number;
  todaysQuantity?: number;
  totalPixelsCount?: number;
  totalQuantity?: number;
  yesterdayQuantity?: number;
}

/**
 * グラフ更新APIのパラメータ。
 */
interface UpdateGraphParams {
  color: GraphColor;
  graphId: string;
  name: string;
  token: string;
  unit: string;
  username: string;
}

/**
 * グラフ削除APIのパラメータ。
 */
interface DeleteGraphParams {
  graphId: string;
  token: string;
  username: string;
}

/**
 * グラフ統計取得APIのパラメータ。
 */
interface GetGraphStatsParams {
  graphId: string;
  username: string;
}

/**
 * Pixela API の成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * 指定ユーザーのグラフ一覧を取得する。
 */
export const getGraphs = async ({
  token,
  username,
}: GetGraphsParams): Promise<GraphDefinition[]> => {
  const response = await pixelaRequest<GraphListResponse>({
    method: "GET",
    path: `/v1/users/${username}/graphs`,
    token,
  });
  return response.graphs;
};

/**
 * 指定グラフの統計情報を取得する。
 */
export const getGraphStats = ({
  graphId,
  username,
}: GetGraphStatsParams): Promise<GraphStats> => {
  return pixelaRequest<GraphStats>({
    method: "GET",
    path: `/v1/users/${username}/graphs/${graphId}/stats`,
  });
};

/**
 * 指定グラフの表示設定を更新する。
 */
export const updateGraph = ({
  color,
  graphId,
  name,
  token,
  unit,
  username,
}: UpdateGraphParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    body: {
      color,
      name,
      unit,
    },
    method: "PUT",
    path: `/v1/users/${username}/graphs/${graphId}`,
    token,
  });
};

/**
 * 指定グラフを削除する。
 */
export const deleteGraph = ({
  graphId,
  token,
  username,
}: DeleteGraphParams): Promise<SuccessResponse> => {
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}/graphs/${graphId}`,
    token,
  });
};
