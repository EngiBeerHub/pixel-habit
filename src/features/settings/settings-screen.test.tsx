import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
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
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
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

  test("shows auth missing error on token update", async () => {
    mockLoadAuthCredentials.mockResolvedValueOnce(null);

    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.changeText(
      screen.getByPlaceholderText("new-token"),
      "new-token-9999"
    );
    fireEvent.press(screen.getByText("トークン変更"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("shows API error when token update fails", async () => {
    mockUpdateUserToken.mockRejectedValueOnce(new Error("トークン更新失敗"));

    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.changeText(
      screen.getByPlaceholderText("new-token"),
      "new-token-9999"
    );
    fireEvent.press(screen.getByText("トークン変更"));

    expect(await screen.findByText("トークン更新失敗")).toBeTruthy();
  });

  test("shows API error when delete user fails", async () => {
    mockDeleteUser.mockRejectedValueOnce(new Error("ユーザー削除失敗"));

    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.press(screen.getByText("ユーザー削除"));
    const alertSpy = jest.mocked(Alert.alert);
    const buttons = alertSpy.mock.calls[0]?.[2] as AlertButton[] | undefined;
    const deleteButton = buttons?.find((button) => button.text === "削除する");
    await act(() => {
      deleteButton?.onPress?.();
    });

    expect(await screen.findByText("ユーザー削除失敗")).toBeTruthy();
  });

  test("shows alert when external link cannot be opened", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValueOnce(false);

    render(<SettingsScreen />);
    await waitForHydration();

    fireEvent.press(screen.getByText("ウェブサイト"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "リンクを開けませんでした。"
      );
    });
  });
});
