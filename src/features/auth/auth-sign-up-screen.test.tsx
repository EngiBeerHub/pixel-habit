import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AuthSessionProvider } from "../../shared/auth/auth-session-context";
import { AuthSignUpScreen } from "./auth-sign-up-screen";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockMutateAsync = jest.fn();
const mockLoadAuthCredentials = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

jest.mock("./use-sign-up", () => ({
  useSignUp: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

describe("AuthSignUpScreen", () => {
  /**
   * QueryClientProvider配下で画面を描画する。
   */
  const renderScreen = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          gcTime: Number.POSITIVE_INFINITY,
        },
        queries: {
          gcTime: Number.POSITIVE_INFINITY,
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <AuthSignUpScreen />
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
    mockLoadAuthCredentials.mockResolvedValue(null);
  });

  test("navigates to sign-in with push from auth flow", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("ログインへ"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-in");
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/auth/sign-in");
  });

  test("shows validation errors for empty fields", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("作成して開始"));

    expect(
      await screen.findByText("usernameは2文字以上で入力してください")
    ).toBeTruthy();
    expect(
      await screen.findByText("tokenは8文字以上で入力してください")
    ).toBeTruthy();
  });

  test("shows API error message", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("作成に失敗しました"));

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText("your-username"),
      "demo-user"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("pixela-token"),
      "12345678"
    );
    fireEvent.press(screen.getByText("作成して開始"));

    expect(await screen.findByText("作成に失敗しました")).toBeTruthy();
  });

  test("shows fallback error when sign up rejects non-Error", async () => {
    mockMutateAsync.mockRejectedValueOnce("unknown error");

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText("your-username"),
      "demo-user"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("pixela-token"),
      "12345678"
    );
    fireEvent.press(screen.getByText("作成して開始"));

    expect(
      await screen.findByText(
        "アカウント作成に失敗しました。再度お試しください。"
      )
    ).toBeTruthy();
  });

  test("navigates to home on success", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      token: "12345678",
      username: "demo-user",
    });

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText("your-username"),
      "demo-user"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("pixela-token"),
      "12345678"
    );
    fireEvent.press(screen.getByText("作成して開始"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });

  test("redirects to home when credentials already exist", async () => {
    mockLoadAuthCredentials.mockResolvedValueOnce({
      token: "token-1234",
      username: "demo-user",
    });

    renderScreen();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });
});
