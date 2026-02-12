import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AuthSettingsScreen } from "./auth-settings-screen";

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: jest.fn(async () => null),
}));

jest.mock("./use-sign-in", () => ({
  useSignIn: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

describe("AuthSettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows validation errors when required fields are empty", async () => {
    render(<AuthSettingsScreen />);

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

    render(<AuthSettingsScreen />);

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

  test("navigates to home on successful sign in", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      token: "12345678",
      username: "demo-user",
    });

    render(<AuthSettingsScreen />);

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
