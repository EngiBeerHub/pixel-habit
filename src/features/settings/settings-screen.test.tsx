import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { SettingsScreen } from "./settings-screen";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockClearAuthSession = jest.fn();
const mockOpenDialog = jest.fn();
const mockCanOpenExternalUrl = jest.fn();
const mockOpenExternalUrl = jest.fn();
const mockAuthedDeleteUser = jest.fn();

const mockUseAuthSession = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

jest.mock("../../shared/ui/app-dialog-provider", () => ({
  useAppDialog: () => ({
    open: (...args: unknown[]) => mockOpenDialog(...args),
  }),
}));

jest.mock("../../shared/platform/app-linking", () => ({
  canOpenExternalUrl: (...args: unknown[]) => mockCanOpenExternalUrl(...args),
  openExternalUrl: (...args: unknown[]) => mockOpenExternalUrl(...args),
}));

jest.mock("../../shared/auth/use-auth-session", () => ({
  useAuthSession: (...args: unknown[]) => mockUseAuthSession(...args),
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuthSession.mockReturnValue({
      clearAuthSession: mockClearAuthSession,
      credentials: {
        token: "token-1234",
        username: "demo-user",
      },
      setAuthSession: jest.fn(),
    });
    mockClearAuthSession.mockResolvedValue(undefined);
    mockCanOpenExternalUrl.mockResolvedValue(true);
    mockOpenExternalUrl.mockResolvedValue(undefined);
    mockUseAuthedPixelaApi.mockReturnValue({
      deleteUser: (...args: unknown[]) => mockAuthedDeleteUser(...args),
    });
    mockAuthedDeleteUser.mockResolvedValue({
      isSuccess: true,
      message: "ユーザー削除成功",
    });
  });

  test("navigates to token update screen", () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId("settings-open-token-screen-button"));

    expect(mockPush).toHaveBeenCalledWith("/settings/token");
  });

  test("logs out after confirmation", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId("settings-logout-button"));

    const actions = mockOpenDialog.mock.calls[0]?.[0]?.actions as
      | Array<{ label: string; onPress?: () => Promise<void> }>
      | undefined;
    const logoutAction = actions?.find(
      (action) => action.label === "ログアウト"
    );

    await act(async () => {
      await logoutAction?.onPress?.();
    });

    expect(mockClearAuthSession).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/auth");
  });

  test("shows auth missing error on delete user", async () => {
    mockUseAuthSession.mockReturnValue({
      clearAuthSession: mockClearAuthSession,
      credentials: null,
      setAuthSession: jest.fn(),
    });

    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId("settings-delete-user-button"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("shows API error when delete user fails", async () => {
    mockAuthedDeleteUser.mockRejectedValueOnce(new Error("ユーザー削除失敗"));

    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId("settings-delete-user-button"));

    const actions = mockOpenDialog.mock.calls[0]?.[0]?.actions as
      | Array<{ label: string; onPress?: () => Promise<void> }>
      | undefined;
    const deleteAction = actions?.find((action) => action.label === "削除する");

    await act(async () => {
      await deleteAction?.onPress?.();
    });

    expect(await screen.findByText("ユーザー削除失敗")).toBeTruthy();
  });

  test("shows dialog when external link cannot be opened", async () => {
    mockCanOpenExternalUrl.mockResolvedValueOnce(false);

    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("ウェブサイト"));

    await waitFor(() => {
      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "リンクを開けませんでした。",
          title: "エラー",
        })
      );
    });
  });
});
