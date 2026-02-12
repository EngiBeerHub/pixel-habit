import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import { SettingsScreen } from "./settings-screen";

const mockReplace = jest.fn();
const mockUpdateUserToken = jest.fn();
const mockDeleteUser = jest.fn();
const mockClearAuthCredentials = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockSaveAuthCredentials = jest.fn();

interface AlertButton {
  onPress?: () => void;
  text?: string;
}

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/api/user", () => ({
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  updateUserToken: (...args: unknown[]) => mockUpdateUserToken(...args),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  clearAuthCredentials: (...args: unknown[]) =>
    mockClearAuthCredentials(...args),
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
  saveAuthCredentials: (...args: unknown[]) => mockSaveAuthCredentials(...args),
}));

jest.mock("react-native/Libraries/Linking/Linking", () => ({
  canOpenURL: jest.fn(async () => true),
  openURL: jest.fn(async () => undefined),
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue({
      token: "token-1234",
      username: "demo-user",
    });
    mockUpdateUserToken.mockResolvedValue({
      isSuccess: true,
      message: "トークン更新成功",
    });
    mockDeleteUser.mockResolvedValue({
      isSuccess: true,
      message: "ユーザー削除成功",
    });
    mockClearAuthCredentials.mockResolvedValue(undefined);
    mockSaveAuthCredentials.mockResolvedValue(undefined);
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * 認証情報のhydrate完了を待ってから操作を行う。
   */
  const waitForHydration = async () => {
    await waitFor(() => {
      expect(mockLoadAuthCredentials).toHaveBeenCalledTimes(1);
    });
  };

  test("shows validation error for short token", async () => {
    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.changeText(screen.getByPlaceholderText("new-token"), "short");
    fireEvent.press(screen.getByText("トークン変更"));

    expect(
      await screen.findByText("新しいトークンは8文字以上で入力してください。")
    ).toBeTruthy();
  });

  test("updates token and stores credentials", async () => {
    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.changeText(
      screen.getByPlaceholderText("new-token"),
      "new-token-9999"
    );
    fireEvent.press(screen.getByText("トークン変更"));

    await waitFor(() => {
      expect(mockUpdateUserToken).toHaveBeenCalledWith({
        newToken: "new-token-9999",
        token: "token-1234",
        username: "demo-user",
      });
    });

    expect(mockSaveAuthCredentials).toHaveBeenCalledWith({
      token: "new-token-9999",
      username: "demo-user",
    });
    expect(await screen.findByText("トークン更新成功")).toBeTruthy();
  });

  test("logs out after confirmation", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("ログアウト"));

    const alertSpy = jest.mocked(Alert.alert);
    const buttons = alertSpy.mock.calls[0]?.[2] as AlertButton[] | undefined;
    const logoutButton = buttons?.find(
      (button) => button.text === "ログアウト"
    );

    logoutButton?.onPress?.();

    await waitFor(() => {
      expect(mockClearAuthCredentials).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });
});
