/**
 * Pixela API のベースURL。
 */
const PIXELA_BASE_URL = "https://pixe.la";

/**
 * Pixela API の標準的なメッセージ形式。
 */
interface PixelaMessageResponse {
  isSuccess?: boolean;
  message?: string;
}

/**
 * Pixela API 呼び出しで発生した HTTP エラーを表す例外。
 */
export class PixelaApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PixelaApiError";
    this.status = status;
  }
}

/**
 * 共通リクエスト関数で利用するオプション。
 */
interface PixelaRequestOptions {
  body?: unknown;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  path: string;
  token?: string;
}

/**
 * Pixela API への共通リクエストを実行し、失敗時は `PixelaApiError` を投げる。
 */
export const pixelaRequest = async <TResponse>({
  body,
  method = "GET",
  path,
  token,
}: PixelaRequestOptions): Promise<TResponse> => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set("X-USER-TOKEN", token);
  }

  const response = await fetch(`${PIXELA_BASE_URL}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const responseBody = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = extractErrorMessage(responseBody);
    throw new PixelaApiError(message, response.status);
  }

  return responseBody as TResponse;
};

/**
 * APIエラー応答からユーザー表示用のメッセージを抽出する。
 */
const extractErrorMessage = (body: unknown): string => {
  if (typeof body !== "object" || body === null) {
    return "Pixela API request failed.";
  }

  const candidate = body as PixelaMessageResponse;
  if (typeof candidate.message === "string" && candidate.message.length > 0) {
    return candidate.message;
  }

  return "Pixela API request failed.";
};
