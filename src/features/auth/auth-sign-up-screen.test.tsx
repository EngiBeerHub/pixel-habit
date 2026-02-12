import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AuthSignUpScreen } from "./auth-sign-up-screen";

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("./use-sign-up", () => ({
  useSignUp: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

describe("AuthSignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows validation errors for empty fields", async () => {
    render(<AuthSignUpScreen />);

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

    render(<AuthSignUpScreen />);

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

    render(<AuthSignUpScreen />);

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

    render(<AuthSignUpScreen />);

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
});
