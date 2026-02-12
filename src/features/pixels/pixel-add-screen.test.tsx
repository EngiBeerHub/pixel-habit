import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { PixelAddScreen } from "./pixel-add-screen";

const mockBack = jest.fn();
const mockAddPixel = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();
let mockRouteParams: {
  date?: string;
  graphId?: string;
  graphName?: string;
  quantity?: string;
} = {
  graphId: "sleep",
  graphName: "Sleep",
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

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
      <PixelAddScreen />
    </QueryClientProvider>
  );
};

describe("PixelAddScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddPixel.mockResolvedValue({
      isSuccess: true,
      message: "追加成功",
    });
    mockUseAuthedPixelaApi.mockReturnValue({
      addPixel: (...args: unknown[]) => mockAddPixel(...args),
    });
    mockRouteParams = {
      date: "20260108",
      graphId: "sleep",
      graphName: "Sleep",
      quantity: "",
    };
  });

  test("shows validation error when quantity is empty", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("記録を追加"));

    expect(
      await screen.findByText("数量は0以上の数値で入力してください")
    ).toBeTruthy();
  });

  test("shows API error when add request fails", async () => {
    mockAddPixel.mockRejectedValueOnce(new Error("追加失敗"));

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "2");
    fireEvent.press(screen.getByText("記録を追加"));

    expect(await screen.findByText("追加失敗")).toBeTruthy();
  });

  test("shows auth error when credentials are missing", async () => {
    mockAddPixel.mockRejectedValueOnce(
      new Error("認証情報が見つかりません。再ログインしてください。")
    );

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "2");
    fireEvent.press(screen.getByText("記録を追加"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("shows graphId error when route param is missing", async () => {
    mockRouteParams = {
      date: "20260108",
      graphName: "Sleep",
      quantity: "",
    };

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "2");
    fireEvent.press(screen.getByText("記録を追加"));

    expect(
      await screen.findByText(
        "グラフIDが不正です。一覧画面からやり直してください。"
      )
    ).toBeTruthy();
  });

  test("shows success message and calls addPixel", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "3");
    fireEvent.press(screen.getByText("記録を追加"));

    await waitFor(() => {
      expect(mockAddPixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
        quantity: "3",
      });
    });

    expect(await screen.findByText("追加成功")).toBeTruthy();
  });
});
