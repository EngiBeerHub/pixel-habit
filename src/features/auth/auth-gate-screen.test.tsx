import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react-native";
import { AuthSessionProvider } from "../../shared/auth/auth-session-context";
import { AuthGateScreen } from "./auth-gate-screen";

const mockReplace = jest.fn();
const mockLoadAuthCredentials = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

describe("AuthGateScreen", () => {
  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Number.POSITIVE_INFINITY,
          retry: false,
        },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <AuthGateScreen />
        </AuthSessionProvider>
      </QueryClientProvider>
    );
  };

  beforeAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      act(() => {
        callback();
      });
    });
  });

  afterAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      callback();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to home when credentials exist", async () => {
    mockLoadAuthCredentials.mockResolvedValue({
      token: "token-1234",
      username: "demo-user",
    });

    renderScreen();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });

  test("redirects to auth hub when credentials are missing", async () => {
    mockLoadAuthCredentials.mockResolvedValue(null);

    renderScreen();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  test("redirects to auth hub when credentials loading throws", async () => {
    mockLoadAuthCredentials.mockRejectedValueOnce(new Error("load failed"));

    renderScreen();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });
});
