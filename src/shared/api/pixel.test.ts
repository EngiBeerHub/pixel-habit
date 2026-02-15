import { addPixel, getPixels, updatePixel } from "./pixel";

const mockPixelaRequest = jest.fn();
const mockGetApiAuthCredentials = jest.fn();

jest.mock("./client", () => ({
  AuthRequiredError: class AuthRequiredError extends Error {},
  pixelaRequest: (...args: unknown[]) => mockPixelaRequest(...args),
}));

jest.mock("./client-auth-context", () => ({
  getApiAuthCredentials: (...args: unknown[]) =>
    mockGetApiAuthCredentials(...args),
}));

describe("pixel optionalData conversion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiAuthCredentials.mockReturnValue({
      token: "token-1234",
      username: "demo-user",
    });
    mockPixelaRequest.mockResolvedValue({
      isSuccess: true,
      message: "ok",
    });
  });

  test("serializes optionalData as JSON when adding pixel", async () => {
    await addPixel({
      date: "20260215",
      graphId: "fitness",
      optionalData: "  朝ラン  ",
      quantity: "1",
    });

    expect(mockPixelaRequest).toHaveBeenCalledWith({
      body: {
        date: "20260215",
        optionalData: '{"memo":"朝ラン"}',
        quantity: "1",
      },
      method: "POST",
      path: "/v1/users/demo-user/graphs/fitness",
    });
  });

  test("omits optionalData when it is whitespace only", async () => {
    await addPixel({
      date: "20260215",
      graphId: "fitness",
      optionalData: "   ",
      quantity: "1",
    });

    expect(mockPixelaRequest).toHaveBeenCalledWith({
      body: {
        date: "20260215",
        quantity: "1",
      },
      method: "POST",
      path: "/v1/users/demo-user/graphs/fitness",
    });
  });

  test("serializes multiline optionalData for update", async () => {
    await updatePixel({
      date: "20260215",
      graphId: "fitness",
      optionalData: "朝ラン\n夜ストレッチ",
      quantity: "2",
    });

    expect(mockPixelaRequest).toHaveBeenCalledWith({
      body: {
        optionalData: '{"memo":"朝ラン\\n夜ストレッチ"}',
        quantity: "2",
      },
      method: "PUT",
      path: "/v1/users/demo-user/graphs/fitness/20260215",
    });
  });

  test("deserializes JSON optionalData and keeps legacy strings", async () => {
    mockPixelaRequest.mockResolvedValueOnce({
      pixels: [
        {
          date: "20260215",
          optionalData: '{"memo":"  朝ラン\\n夜ストレッチ  "}',
          quantity: "2",
        },
        {
          date: "20260214",
          optionalData: "legacy memo",
          quantity: "1",
        },
        {
          date: "20260213",
          optionalData: "{invalid-json",
          quantity: "3",
        },
      ],
    });

    await expect(
      getPixels({
        graphId: "fitness",
      })
    ).resolves.toEqual([
      {
        date: "20260215",
        optionalData: "朝ラン\n夜ストレッチ",
        quantity: "2",
      },
      {
        date: "20260214",
        optionalData: "legacy memo",
        quantity: "1",
      },
      {
        date: "20260213",
        optionalData: "{invalid-json",
        quantity: "3",
      },
    ]);
  });
});
