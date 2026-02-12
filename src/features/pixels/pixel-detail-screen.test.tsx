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
import { PixelDetailScreen } from "./pixel-detail-screen";

const mockBack = jest.fn();
const mockUpdatePixel = jest.fn();
const mockDeletePixel = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockShowAlert = jest.fn();
let mockRouteParams: {
  date?: string;
  graphId?: string;
  graphName?: string;
  quantity?: string;
} = {
  date: "20260108",
  graphId: "sleep",
  graphName: "Sleep",
  quantity: "2",
};

interface AlertButton {
  onPress?: () => void;
  text?: string;
}

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/api/pixel", () => ({
  deletePixel: (...args: unknown[]) => mockDeletePixel(...args),
  updatePixel: (...args: unknown[]) => mockUpdatePixel(...args),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

jest.mock("../../shared/platform/app-alert", () => ({
  showAlert: (...args: unknown[]) => mockShowAlert(...args),
}));

const credentials = {
  token: "token-1234",
  username: "demo-user",
};

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

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <PixelDetailScreen />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
};

describe("PixelDetailScreen", () => {
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
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockUpdatePixel.mockResolvedValue({
      isSuccess: true,
      message: "更新成功",
    });
    mockDeletePixel.mockResolvedValue({
      isSuccess: true,
      message: "削除成功",
    });
    mockRouteParams = {
      date: "20260108",
      graphId: "sleep",
      graphName: "Sleep",
      quantity: "2",
    };
    mockShowAlert.mockImplementation(() => undefined);
  });

  test("shows validation error when quantity is empty", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "");
    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText("数量は0以上の数値で入力してください")
    ).toBeTruthy();
  });

  test("updates pixel and shows success message", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "5");
    fireEvent.press(screen.getByText("更新"));

    await waitFor(() => {
      expect(mockUpdatePixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
        quantity: "5",
        token: "token-1234",
        username: "demo-user",
      });
    });

    expect(await screen.findByText("更新成功")).toBeTruthy();
  });

  test("deletes pixel after confirmation", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("削除"));

    const confirmButtons = mockShowAlert.mock.calls[0]?.[2] as
      | AlertButton[]
      | undefined;
    const deleteConfirmButton = confirmButtons?.find(
      (button) => button.text === "削除する"
    );

    deleteConfirmButton?.onPress?.();

    await waitFor(() => {
      expect(mockDeletePixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
        token: "token-1234",
        username: "demo-user",
      });
    });

    const completionButtons = mockShowAlert.mock.calls[1]?.[2] as
      | AlertButton[]
      | undefined;
    const okButton = completionButtons?.find((button) => button.text === "OK");
    okButton?.onPress?.();

    expect(mockBack).toHaveBeenCalled();
  });

  test("shows auth error when credentials are missing on update", async () => {
    mockLoadAuthCredentials.mockResolvedValue(null);

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "5");
    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("shows graph/date error when route params are invalid", async () => {
    mockRouteParams = {
      graphId: "sleep",
      graphName: "Sleep",
      quantity: "2",
    };

    renderScreen();

    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText("graphIdまたはdateが不正です。")
    ).toBeTruthy();
  });
});
