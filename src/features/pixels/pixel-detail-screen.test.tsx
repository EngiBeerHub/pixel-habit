import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import { PixelDetailScreen } from "./pixel-detail-screen";

const mockBack = jest.fn();
const mockUpdatePixel = jest.fn();
const mockDeletePixel = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockRouteParams: {
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
      <PixelDetailScreen />
    </QueryClientProvider>
  );
};

describe("PixelDetailScreen", () => {
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
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    const alertSpy = jest.mocked(Alert.alert);
    const confirmButtons = alertSpy.mock.calls[0]?.[2] as
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

    const completionButtons = alertSpy.mock.calls[1]?.[2] as
      | AlertButton[]
      | undefined;
    const okButton = completionButtons?.find((button) => button.text === "OK");
    okButton?.onPress?.();

    expect(mockBack).toHaveBeenCalled();
  });
});
