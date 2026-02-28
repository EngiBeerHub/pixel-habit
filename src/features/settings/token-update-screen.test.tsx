import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { TokenUpdateScreen } from "./token-update-screen";

const mockBack = jest.fn();
const mockSetAuthSession = jest.fn();
const mockUpdateUserToken = jest.fn();
const mockUseAuthSession = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/auth/use-auth-session", () => ({
  useAuthSession: (...args: unknown[]) => mockUseAuthSession(...args),
}));

jest.mock("../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

describe("TokenUpdateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({
      credentials: {
        token: "token-1234",
        username: "demo-user",
      },
      setAuthSession: mockSetAuthSession,
    });
    mockUseAuthedPixelaApi.mockReturnValue({
      updateUserToken: (...args: unknown[]) => mockUpdateUserToken(...args),
    });
    mockSetAuthSession.mockResolvedValue(undefined);
    mockUpdateUserToken.mockResolvedValue({
      isSuccess: true,
      message: "トークン更新成功",
    });
  });

  test("shows validation error for short token", async () => {
    render(<TokenUpdateScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("new-token"), "short");
    fireEvent.press(screen.getByTestId("settings-update-token-button"));

    expect(
      await screen.findByText("新しいトークンは8文字以上で入力してください。")
    ).toBeTruthy();
  });

  test("updates token and stores credentials", async () => {
    render(<TokenUpdateScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("new-token"),
      "new-token-9999"
    );
    fireEvent.press(screen.getByTestId("settings-update-token-button"));

    await waitFor(() => {
      expect(mockUpdateUserToken).toHaveBeenCalledWith({
        newToken: "new-token-9999",
      });
    });

    expect(mockSetAuthSession).toHaveBeenCalledWith({
      token: "new-token-9999",
      username: "demo-user",
    });
    expect(await screen.findByText("トークン更新成功")).toBeTruthy();
  });

  test("does not duplicate token title in content when header title is used", () => {
    render(<TokenUpdateScreen />);

    expect(screen.getAllByText("トークン変更")).toHaveLength(1);
  });
});
