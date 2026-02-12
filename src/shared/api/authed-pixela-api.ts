import { useAuthSession } from "../auth/use-auth-session";
import {
  createGraph,
  deleteGraph,
  type GraphColor,
  type GraphDefinition,
  type GraphStats,
  type GraphType,
  getGraphStats,
  getGraphs,
  updateGraph,
} from "./graph";
import {
  addPixel,
  deletePixel,
  getPixels,
  type Pixel,
  updatePixel,
} from "./pixel";
import { deleteUser, updateUserToken } from "./user";

/**
 * Pixela APIの成功レスポンス形式。
 */
interface SuccessResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * 認証付きグラフ作成の入力値。
 */
interface CreateGraphInput {
  color: GraphColor;
  id: string;
  name: string;
  timezone: string;
  type: GraphType;
  unit: string;
}

/**
 * 認証付きグラフ更新の入力値。
 */
interface UpdateGraphInput {
  color: GraphColor;
  graphId: string;
  name: string;
  timezone: string;
  unit: string;
}

/**
 * 認証付きグラフ削除の入力値。
 */
interface DeleteGraphInput {
  graphId: string;
}

/**
 * 認証付きグラフ統計取得の入力値。
 */
interface GetGraphStatsInput {
  graphId: string;
}

/**
 * 認証付きピクセル一覧取得の入力値。
 */
interface GetPixelsInput {
  from?: string;
  graphId: string;
  to?: string;
}

/**
 * 認証付きピクセル追加の入力値。
 */
interface AddPixelInput {
  date: string;
  graphId: string;
  quantity: string;
}

/**
 * 認証付きピクセル更新の入力値。
 */
interface UpdatePixelInput {
  date: string;
  graphId: string;
  quantity: string;
}

/**
 * 認証付きピクセル削除の入力値。
 */
interface DeletePixelInput {
  date: string;
  graphId: string;
}

/**
 * 認証付きトークン更新の入力値。
 */
interface UpdateUserTokenInput {
  newToken: string;
}

/**
 * 画面層へ公開する認証注入済みPixela API。
 */
export interface AuthedPixelaApi {
  addPixel: (input: AddPixelInput) => Promise<SuccessResponse>;
  createGraph: (input: CreateGraphInput) => Promise<SuccessResponse>;
  deleteGraph: (input: DeleteGraphInput) => Promise<SuccessResponse>;
  deletePixel: (input: DeletePixelInput) => Promise<SuccessResponse>;
  deleteUser: () => Promise<SuccessResponse>;
  getGraphStats: (input: GetGraphStatsInput) => Promise<GraphStats>;
  getGraphs: () => Promise<GraphDefinition[]>;
  getPixels: (input: GetPixelsInput) => Promise<Pixel[]>;
  isAuthenticated: boolean;
  updateGraph: (input: UpdateGraphInput) => Promise<SuccessResponse>;
  updatePixel: (input: UpdatePixelInput) => Promise<SuccessResponse>;
  updateUserToken: (input: UpdateUserTokenInput) => Promise<SuccessResponse>;
  username: string | null;
}

/**
 * 画面から使う認証注入済みAPI hook。
 */
export const useAuthedPixelaApi = (): AuthedPixelaApi => {
  const { credentials } = useAuthSession();

  return {
    addPixel,
    createGraph,
    deleteGraph,
    deletePixel,
    deleteUser,
    getGraphs,
    getGraphStats,
    getPixels,
    isAuthenticated: Boolean(credentials),
    updateGraph,
    updatePixel,
    updateUserToken,
    username: credentials?.username ?? null,
  };
};
