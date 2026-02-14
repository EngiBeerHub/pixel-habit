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
import { GraphDetailScreen } from "./graph-detail-screen";

const mockBack = jest.fn();
const mockGetPixels = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const MONTH_RANGE_LABEL_PATTERN = /2026年2月: 20260201 - 20260228/;
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
    back: mockBack,
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
      <AuthSessionProvider>
        <GraphDetailScreen />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
};

describe("GraphDetailScreen", () => {
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
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 14, 12, 0, 0));
    mockRouteParams = {
      graphId: "sleep",
      graphName: "Sleep",
    };
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetPixels.mockResolvedValue([
      { date: "20260213", quantity: "2" },
      { date: "20260211", quantity: "4" },
      { date: "20260210", quantity: "0" },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("loads month range by default", async () => {
    renderScreen();

    expect(await screen.findByText("Sleep")).toBeTruthy();
    expect(await screen.findByText(MONTH_RANGE_LABEL_PATTERN)).toBeTruthy();

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20260201",
        graphId: "sleep",
        to: "20260228",
      });
    });
  });

  test("switches to year range", async () => {
    renderScreen();
    await screen.findByText("Sleep");

    fireEvent.press(screen.getByTestId("graph-detail-mode-year"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20260101",
        graphId: "sleep",
        to: "20261231",
      });
    });
  });

  test("shows light summary", async () => {
    renderScreen();

    expect(await screen.findByText("合計: 6")).toBeTruthy();
    expect(await screen.findByText("記録日数: 2")).toBeTruthy();
    expect(await screen.findByText("最大値: 4")).toBeTruthy();
  });

  test("shows error and allows retry", async () => {
    mockGetPixels.mockRejectedValueOnce(new Error("取得失敗"));

    renderScreen();

    expect(await screen.findByText("取得失敗")).toBeTruthy();
    fireEvent.press(screen.getByTestId("graph-detail-retry"));

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledTimes(2);
    });
  });

  test("shows graphId invalid message", async () => {
    mockRouteParams = {
      graphName: "Sleep",
    };

    renderScreen();

    expect(
      await screen.findByText(
        "グラフIDが不正です。Home画面からやり直してください。"
      )
    ).toBeTruthy();
  });
});
