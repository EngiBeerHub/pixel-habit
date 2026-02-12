import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { PixelListScreen } from "./pixel-list-screen";

const mockPush = jest.fn();
const mockGetPixels = jest.fn();
const mockLoadAuthCredentials = jest.fn();
let mockRouteParams: {
  graphId?: string;
  graphName?: string;
} = {
  graphId: "sleep",
  graphName: "Sleep",
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../../shared/api/pixel", () => ({
  getPixels: (...args: unknown[]) => mockGetPixels(...args),
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
      <PixelListScreen />
    </QueryClientProvider>
  );
};

describe("PixelListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetPixels.mockResolvedValue([
      {
        date: "20260108",
        quantity: "3",
      },
    ]);
    mockRouteParams = {
      graphId: "sleep",
      graphName: "Sleep",
    };
  });

  test("shows empty state when no pixels exist", async () => {
    mockGetPixels.mockResolvedValueOnce([]);

    renderScreen();

    expect(
      await screen.findByText(
        "まだ記録がありません。上のボタンから追加してください。"
      )
    ).toBeTruthy();
  });

  test("shows API error and retries", async () => {
    mockGetPixels.mockRejectedValueOnce(new Error("取得失敗"));

    renderScreen();

    expect(await screen.findByText("取得失敗")).toBeTruthy();
    fireEvent.press(screen.getByText("再試行"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledTimes(2);
    });
  });

  test("navigates to add and edit screens", async () => {
    renderScreen();

    expect(await screen.findByText("20260108")).toBeTruthy();

    fireEvent.press(screen.getByText("記録を追加"));
    expect(mockPush).toHaveBeenCalledWith({
      params: {
        graphId: "sleep",
        graphName: "Sleep",
      },
      pathname: "/graphs/[graphId]/add",
    });

    fireEvent.press(screen.getByText("編集/削除"));
    expect(mockPush).toHaveBeenCalledWith({
      params: {
        date: "20260108",
        graphId: "sleep",
        graphName: "Sleep",
        quantity: "3",
      },
      pathname: "/graphs/[graphId]/pixels/[date]",
    });
  });
});
