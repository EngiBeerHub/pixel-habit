import { render, waitFor } from "@testing-library/react-native";
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to home when credentials exist", async () => {
    mockLoadAuthCredentials.mockResolvedValue({
      token: "token-1234",
      username: "demo-user",
    });

    render(<AuthGateScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });

  test("redirects to auth hub when credentials are missing", async () => {
    mockLoadAuthCredentials.mockResolvedValue(null);

    render(<AuthGateScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  test("redirects to auth hub when credentials loading throws", async () => {
    mockLoadAuthCredentials.mockRejectedValueOnce(new Error("load failed"));

    render(<AuthGateScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });
});
