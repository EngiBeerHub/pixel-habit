import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { GraphEditScreen } from "./graph-edit-screen";

const mockBack = jest.fn();
const mockUpdateGraph = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();
let mockRouteParams: {
  color?: string;
  graphId?: string;
  graphName?: string;
  timezone?: string;
  unit?: string;
} = {
  color: "sora",
  graphId: "sleep",
  graphName: "Sleep",
  timezone: "Asia/Tokyo",
  unit: "hour",
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/api/graph", () => ({
  graphColorOptions: ["shibafu", "sora"],
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
      <GraphEditScreen />
    </QueryClientProvider>
  );
};

describe("GraphEditScreen", () => {
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
    mockUpdateGraph.mockResolvedValue({
      isSuccess: true,
      message: "更新成功",
    });
    mockUseAuthedPixelaApi.mockReturnValue({
      updateGraph: (...args: unknown[]) => mockUpdateGraph(...args),
    });
    mockRouteParams = {
      color: "sora",
      graphId: "sleep",
      graphName: "Sleep",
      timezone: "Asia/Tokyo",
      unit: "hour",
    };
  });

  test("shows graphId error when route param is missing", async () => {
    mockRouteParams = {
      color: "sora",
      graphName: "Sleep",
      timezone: "Asia/Tokyo",
      unit: "hour",
    };

    renderScreen();

    expect(
      await screen.findByText(
        "グラフIDが不正です。Home画面からやり直してください。"
      )
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  test("shows validation error when name is empty", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("グラフ名"), "");
    fireEvent.press(screen.getByText("保存"));

    expect(await screen.findByText("グラフ名は必須です")).toBeTruthy();
  });

  test("updates graph and shows success message", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("グラフ名"), "Sleep v2");
    fireEvent.changeText(
      screen.getByPlaceholderText("回, km, page など"),
      "minutes"
    );
    fireEvent.press(screen.getByText("保存"));

    await waitFor(() => {
      expect(mockUpdateGraph).toHaveBeenCalledWith({
        color: "sora",
        graphId: "sleep",
        name: "Sleep v2",
        timezone: "Asia/Tokyo",
        unit: "minutes",
      });
    });

    expect(await screen.findByText("更新成功")).toBeTruthy();
  });

  test("shows auth error when credentials are missing", async () => {
    mockUpdateGraph.mockRejectedValueOnce(
      new Error("認証情報が見つかりません。再ログインしてください。")
    );

    renderScreen();

    fireEvent.press(screen.getByText("保存"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });
});
