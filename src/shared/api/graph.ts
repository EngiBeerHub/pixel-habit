import { pixelaRequest } from "./client";

/**
 * Pixela のグラフ定義レスポンス。
 */
export interface GraphDefinition {
  color: "ajisai" | "ichou" | "kuro" | "momiji" | "shibafu" | "sora";
  id: string;
  name: string;
  timezone: string;
  unit: string;
}

interface GraphListResponse {
  graphs: GraphDefinition[];
}

interface GetGraphsParams {
  token: string;
  username: string;
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
