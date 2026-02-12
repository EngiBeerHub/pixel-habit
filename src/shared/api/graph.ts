import { AuthRequiredError, pixelaRequest } from "./client";
import { getApiAuthCredentials } from "./client-auth-context";

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
 * Pixelaで利用できるグラフ種別。
 */
export const graphTypeOptions = ["float", "int"] as const;

/**
 * Pixelaで利用できるグラフ種別の型。
 */
export type GraphType = (typeof graphTypeOptions)[number];

/**
 * Pixela のグラフ定義レスポンス。
 */
export interface GraphDefinition {
  color: GraphColor;
  id: string;
  name: string;
  type: GraphType;
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
 * グラフ作成APIのパラメータ。
 */
interface CreateGraphParams {
  color: GraphColor;
  id: string;
  name: string;
  timezone: string;
  type: GraphType;
  unit: string;
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
  timezone: string;
  unit: string;
}

/**
 * グラフ削除APIのパラメータ。
 */
interface DeleteGraphParams {
  graphId: string;
}

/**
 * グラフ統計取得APIのパラメータ。
 */
interface GetGraphStatsParams {
  graphId: string;
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
export const getGraphs = async (): Promise<GraphDefinition[]> => {
  const username = getRequiredUsername();
  const response = await pixelaRequest<GraphListResponse>({
    method: "GET",
    path: `/v1/users/${username}/graphs`,
  });
  return response.graphs;
};

/**
 * 新しいグラフを作成する。
 */
export const createGraph = ({
  color,
  id,
  name,
  timezone,
  type,
  unit,
}: CreateGraphParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    body: {
      color,
      id,
      name,
      timezone,
      type,
      unit,
    },
    method: "POST",
    path: `/v1/users/${username}/graphs`,
  });
};

/**
 * 指定グラフの統計情報を取得する。
 */
export const getGraphStats = ({
  graphId,
}: GetGraphStatsParams): Promise<GraphStats> => {
  const username = getRequiredUsername();
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
  timezone,
  unit,
}: UpdateGraphParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    body: {
      color,
      name,
      timezone,
      unit,
    },
    method: "PUT",
    path: `/v1/users/${username}/graphs/${graphId}`,
  });
};

/**
 * 指定グラフを削除する。
 */
export const deleteGraph = ({
  graphId,
}: DeleteGraphParams): Promise<SuccessResponse> => {
  const username = getRequiredUsername();
  return pixelaRequest<SuccessResponse>({
    method: "DELETE",
    path: `/v1/users/${username}/graphs/${graphId}`,
  });
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
