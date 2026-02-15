import { AuthRequiredError, pixelaRequest } from "./client";
import {
  clearApiAuthCredentials,
  setApiAuthCredentials,
} from "./client-auth-context";

interface MockResponseOptions {
  body: unknown;
  contentType?: string;
  ok?: boolean;
  status?: number;
}

/**
 * fetchモック用の最小レスポンスを生成する。
 */
const createMockResponse = ({
  body,
  contentType = "application/json",
  ok = true,
  status = 200,
}: MockResponseOptions): Response => {
  const jsonBody = JSON.stringify(body);
  return {
    headers: new Headers({
      "content-type": contentType,
    }),
    json: jest.fn().mockResolvedValue(body),
    ok,
    status,
    text: jest.fn().mockResolvedValue(jsonBody),
  } as unknown as Response;
};

describe("pixelaRequest", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    clearApiAuthCredentials();
    globalThis.fetch = jest.fn().mockResolvedValue(
      createMockResponse({
        body: { isSuccess: true, message: "ok" },
      })
    ) as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("sets explicit token header when token is provided", async () => {
    await pixelaRequest({
      method: "GET",
      path: "/v1/users/demo-user/graphs",
      token: "explicit-token",
    });

    const fetchArgs = (globalThis.fetch as jest.Mock).mock.calls[0]?.[1] as
      | RequestInit
      | undefined;
    const headers = fetchArgs?.headers as Headers;
    expect(headers.get("X-USER-TOKEN")).toBe("explicit-token");
  });

  test("sets context token header when token is omitted", async () => {
    setApiAuthCredentials({
      token: "context-token",
      username: "demo-user",
    });

    await pixelaRequest({
      method: "GET",
      path: "/v1/users/demo-user/graphs",
    });

    const fetchArgs = (globalThis.fetch as jest.Mock).mock.calls[0]?.[1] as
      | RequestInit
      | undefined;
    const headers = fetchArgs?.headers as Headers;
    expect(headers.get("X-USER-TOKEN")).toBe("context-token");
  });

  test("throws AuthRequiredError for auth-required path without token", async () => {
    await expect(
      pixelaRequest({
        method: "GET",
        path: "/v1/users/demo-user/graphs",
      })
    ).rejects.toBeInstanceOf(AuthRequiredError);
  });

  test("retries rejected 503 response and succeeds", async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(
        createMockResponse({
          body: {
            isRejected: true,
            message: "Please retry this request.",
          },
          ok: false,
          status: 503,
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          body: { isSuccess: true, message: "ok" },
        })
      );

    const requestPromise = pixelaRequest<{
      isSuccess: boolean;
      message: string;
    }>({
      method: "GET",
      path: "/v1/users/demo-user/graphs",
      token: "explicit-token",
    });
    await jest.advanceTimersByTimeAsync(100);

    await expect(requestPromise).resolves.toEqual({
      isSuccess: true,
      message: "ok",
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test("does not retry non-rejected 503 response", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({
        body: {
          message: "Service unavailable",
        },
        ok: false,
        status: 503,
      })
    );

    await expect(
      pixelaRequest({
        method: "GET",
        path: "/v1/users/demo-user/graphs",
        token: "explicit-token",
      })
    ).rejects.toMatchObject({
      message: "Service unavailable",
      name: "PixelaApiError",
      status: 503,
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
