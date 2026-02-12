import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AuthSettingsScreen } from "./auth-settings-screen";

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();
const mockLoadAuthCredentials = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

jest.mock("./use-sign-in", () => ({
  useSignIn: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

describe("AuthSettingsScreen", () => {
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
        <AuthSettingsScreen />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue(null);
  });

  test("shows validation errors when required fields are empty", async () => {
    renderScreen();

    const loginButtons = screen.getAllByRole("button", { name: "ログイン" });
    fireEvent.press(loginButtons[0]);

    expect(
      await screen.findByText("usernameは2文字以上で入力してください")
    ).toBeTruthy();
    expect(
      await screen.findByText("tokenは8文字以上で入力してください")
    ).toBeTruthy();
  });

  test("shows api error message when sign in fails", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("認証に失敗しました"));

    renderScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText("your-username"),
      "demo-user"
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("pixela-token"),
      "12345678"
    );
    const loginButtons = screen.getAllByRole("button", { name: "ログイン" });
    fireEvent.press(loginButtons[0]);

    expect(await screen.findByText("認証に失敗しました")).toBeTruthy();
  });

  test("shows fallback error when sign in rejects non-Error", async () => {
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
    const loginButtons = screen.getAllByRole("button", { name: "ログイン" });
    fireEvent.press(loginButtons[0]);

    expect(
      await screen.findByText(
        "ログインに失敗しました。username/tokenを確認して再度お試しください。"
      )
    ).toBeTruthy();
  });

  test("shows load error when credentials hydration fails", async () => {
    mockLoadAuthCredentials.mockRejectedValueOnce(new Error("load failed"));

    renderScreen();

    expect(
      await screen.findByText("保存済みの接続情報を読み込めませんでした。")
    ).toBeTruthy();
  });

  test("navigates to home on successful sign in", async () => {
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
    const loginButtons = screen.getAllByRole("button", { name: "ログイン" });
    fireEvent.press(loginButtons[0]);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });
});
