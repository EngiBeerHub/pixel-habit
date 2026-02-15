import { getApiAuthCredentials } from "./client-auth-context";

/**
 * Pixela API のベースURL。
 */
const PIXELA_BASE_URL = "https://pixe.la";
const PIXELA_RETRY_MAX_COUNT = 10;
const PIXELA_RETRY_DELAY_MS = 100;

/**
 * Pixela API の標準的なメッセージ形式。
 */
interface PixelaMessageResponse {
  isRejected?: boolean;
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
 * 認証必須APIで認証情報が未設定のときに投げる例外。
 */
export class AuthRequiredError extends Error {
  constructor(message = "認証情報が見つかりません。再ログインしてください。") {
    super(message);
    this.name = "AuthRequiredError";
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

  const resolvedToken = token ?? getApiAuthCredentials()?.token;
  const shouldRequireAuth = path.startsWith("/v1/users/");
  if (shouldRequireAuth && !resolvedToken) {
    throw new AuthRequiredError();
  }
  if (resolvedToken) {
    headers.set("X-USER-TOKEN", resolvedToken);
  }

  let retryCount = 0;
  while (true) {
    const response = await fetch(`${PIXELA_BASE_URL}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers,
      method,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const responseBody = isJson ? await response.json() : await response.text();

    if (response.ok) {
      return responseBody as TResponse;
    }

    if (
      shouldRetryPixelaRejectedRequest({
        responseBody,
        retryCount,
        status: response.status,
      })
    ) {
      retryCount += 1;
      await wait(PIXELA_RETRY_DELAY_MS);
      continue;
    }

    const message = extractErrorMessage(responseBody);
    throw new PixelaApiError(message, response.status);
  }
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

/**
 * Pixela無料枠の一時拒否（503 + isRejected=true）のみ自動再試行する。
 */
const shouldRetryPixelaRejectedRequest = ({
  responseBody,
  retryCount,
  status,
}: {
  responseBody: unknown;
  retryCount: number;
  status: number;
}): boolean => {
  if (status !== 503 || retryCount >= PIXELA_RETRY_MAX_COUNT) {
    return false;
  }
  if (typeof responseBody !== "object" || responseBody === null) {
    return false;
  }
  const candidate = responseBody as PixelaMessageResponse;
  return candidate.isRejected === true;
};

/**
 * 指定ミリ秒だけ待機する。
 */
const wait = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
