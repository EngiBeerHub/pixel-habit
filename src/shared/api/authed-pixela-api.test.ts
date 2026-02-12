import { renderHook } from "@testing-library/react-native";
import { useAuthedPixelaApi } from "./authed-pixela-api";
import { AuthRequiredError } from "./client";

const mockCreateGraph = jest.fn();
const mockDeleteGraph = jest.fn();
const mockGetGraphs = jest.fn();
const mockGetGraphStats = jest.fn();
const mockUpdateGraph = jest.fn();
const mockAddPixel = jest.fn();
const mockDeletePixel = jest.fn();
const mockGetPixels = jest.fn();
const mockUpdatePixel = jest.fn();
const mockDeleteUser = jest.fn();
const mockUpdateUserToken = jest.fn();
const mockUseAuthSession = jest.fn();

jest.mock("./graph", () => ({
  createGraph: (...args: unknown[]) => mockCreateGraph(...args),
  deleteGraph: (...args: unknown[]) => mockDeleteGraph(...args),
  getGraphs: (...args: unknown[]) => mockGetGraphs(...args),
  getGraphStats: (...args: unknown[]) => mockGetGraphStats(...args),
  updateGraph: (...args: unknown[]) => mockUpdateGraph(...args),
}));

jest.mock("./pixel", () => ({
  addPixel: (...args: unknown[]) => mockAddPixel(...args),
  deletePixel: (...args: unknown[]) => mockDeletePixel(...args),
  getPixels: (...args: unknown[]) => mockGetPixels(...args),
  updatePixel: (...args: unknown[]) => mockUpdatePixel(...args),
}));

jest.mock("./user", () => ({
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  updateUserToken: (...args: unknown[]) => mockUpdateUserToken(...args),
}));

jest.mock("../auth/use-auth-session", () => ({
  useAuthSession: (...args: unknown[]) => mockUseAuthSession(...args),
}));

describe("useAuthedPixelaApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({
      clearAuthSession: jest.fn(),
      credentials: {
        token: "token-1234",
        username: "demo-user",
      },
      hasLoadError: false,
      refreshAuthSession: jest.fn(),
      setAuthSession: jest.fn(),
      status: "authenticated",
    });
  });

  test("returns session flags from auth state", () => {
    const { result } = renderHook(() => useAuthedPixelaApi());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe("demo-user");
  });

  test("injects credentials when calling graph and pixel APIs", async () => {
    mockGetGraphs.mockResolvedValueOnce([]);
    mockGetPixels.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAuthedPixelaApi());
    await result.current.getGraphs();
    await result.current.getPixels({
      graphId: "sleep",
    });

    expect(mockGetGraphs).toHaveBeenCalledWith();
    expect(mockGetPixels).toHaveBeenCalledWith({
      graphId: "sleep",
    });
  });

  test("injects credentials when calling mutation APIs", async () => {
    mockCreateGraph.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockUpdateGraph.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockDeleteGraph.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockAddPixel.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockUpdatePixel.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockDeletePixel.mockResolvedValueOnce({ isSuccess: true, message: "ok" });
    mockUpdateUserToken.mockResolvedValueOnce({
      isSuccess: true,
      message: "ok",
    });
    mockDeleteUser.mockResolvedValueOnce({ isSuccess: true, message: "ok" });

    const { result } = renderHook(() => useAuthedPixelaApi());
    await result.current.createGraph({
      color: "sora",
      id: "sleep",
      name: "Sleep",
      timezone: "Asia/Tokyo",
      type: "int",
      unit: "hour",
    });
    await result.current.updateGraph({
      color: "sora",
      graphId: "sleep",
      name: "Sleep2",
      timezone: "Asia/Tokyo",
      unit: "hour",
    });
    await result.current.deleteGraph({ graphId: "sleep" });
    await result.current.addPixel({
      date: "20260101",
      graphId: "sleep",
      quantity: "2",
    });
    await result.current.updatePixel({
      date: "20260101",
      graphId: "sleep",
      quantity: "3",
    });
    await result.current.deletePixel({
      date: "20260101",
      graphId: "sleep",
    });
    await result.current.updateUserToken({ newToken: "new-token-9999" });
    await result.current.deleteUser();

    expect(mockCreateGraph).toHaveBeenCalledWith({
      color: "sora",
      id: "sleep",
      name: "Sleep",
      timezone: "Asia/Tokyo",
      type: "int",
      unit: "hour",
    });
    expect(mockUpdateGraph).toHaveBeenCalledWith({
      color: "sora",
      graphId: "sleep",
      name: "Sleep2",
      timezone: "Asia/Tokyo",
      unit: "hour",
    });
    expect(mockDeleteGraph).toHaveBeenCalledWith({
      graphId: "sleep",
    });
    expect(mockAddPixel).toHaveBeenCalledWith({
      date: "20260101",
      graphId: "sleep",
      quantity: "2",
    });
    expect(mockUpdatePixel).toHaveBeenCalledWith({
      date: "20260101",
      graphId: "sleep",
      quantity: "3",
    });
    expect(mockDeletePixel).toHaveBeenCalledWith({
      date: "20260101",
      graphId: "sleep",
    });
    expect(mockUpdateUserToken).toHaveBeenCalledWith({
      newToken: "new-token-9999",
    });
    expect(mockDeleteUser).toHaveBeenCalledWith();
  });

  test("throws AuthRequiredError when credentials are missing", () => {
    mockUseAuthSession.mockReturnValue({
      clearAuthSession: jest.fn(),
      credentials: null,
      hasLoadError: false,
      refreshAuthSession: jest.fn(),
      setAuthSession: jest.fn(),
      status: "anonymous",
    });

    const { result } = renderHook(() => useAuthedPixelaApi());

    mockGetGraphs.mockImplementationOnce(() => {
      throw new AuthRequiredError();
    });

    expect(() => result.current.getGraphs()).toThrow(AuthRequiredError);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.username).toBeNull();
  });
});
