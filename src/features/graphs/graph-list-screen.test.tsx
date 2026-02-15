import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";
import { AuthSessionProvider } from "../../shared/auth/auth-session-context";
import { getTodayAsYyyyMmDd } from "../../shared/lib/date";
import { GraphListScreen } from "./graph-list-screen";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockGetGraphs = jest.fn();
const mockAddPixel = jest.fn();
const mockGetPixels = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockToastShow = jest.fn();
let consoleErrorSpy: jest.SpyInstance;

/**
 * 非同期の完了タイミングをテスト側で制御するためのDeferred。
 */
interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

/**
 * pending状態を検証するため、外側からresolveできるPromiseを生成する。
 */
const createDeferred = <T,>(): Deferred<T> => {
  let resolve: ((value: T) => void) | null = null;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  if (!resolve) {
    throw new Error("deferred resolve function was not initialized");
  }
  return { promise, resolve };
};

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

jest.mock("../../shared/api/graph", () => ({
  deleteGraph: jest.fn(),
  getGraphs: (...args: unknown[]) => mockGetGraphs(...args),
}));

jest.mock("../../shared/api/pixel", () => ({
  addPixel: (...args: unknown[]) => mockAddPixel(...args),
  getPixels: (...args: unknown[]) => mockGetPixels(...args),
}));

jest.mock("heroui-native", () => {
  const { Pressable, Text, TextInput, View } = require("react-native");
  const Card = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  Card.Header = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  Card.Title = ({ children }: { children?: ReactNode }) => (
    <Text>{children}</Text>
  );
  Card.Body = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  const BottomSheet = ({
    children,
    isOpen,
  }: {
    children?: ReactNode;
    isOpen?: boolean;
  }) => (isOpen ? <View>{children}</View> : null);
  BottomSheet.Portal = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  BottomSheet.Overlay = () => null;
  BottomSheet.Content = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  BottomSheet.Title = ({ children }: { children?: ReactNode }) => (
    <Text>{children}</Text>
  );
  BottomSheet.Description = ({ children }: { children?: ReactNode }) => (
    <Text>{children}</Text>
  );

  return {
    BottomSheet,
    Button: ({
      children,
      onPress,
      testID,
    }: {
      children?: ReactNode;
      onPress?: () => void;
      testID?: string;
    }) => (
      <Pressable onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </Pressable>
    ),
    Card,
    Input: ({
      onBlur,
      onChangeText,
      placeholder,
      testID,
      value,
    }: {
      onBlur?: () => void;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      testID?: string;
      value?: string;
    }) => (
      <TextInput
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />
    ),
    useToast: () => ({
      toast: {
        show: (...args: unknown[]) => mockToastShow(...args),
      },
    }),
  };
});

jest.mock("./components/graph-card", () => {
  const { Pressable, Text, View } = require("react-native");

  const GraphCard = ({
    graph,
    onPressAddForDate,
    onPressAddToday,
    onPressOpenDetail,
  }: {
    graph: { name: string };
    onPressAddForDate: (graph: { name: string }, date: string) => void;
    onPressAddToday: (graph: { name: string }) => void;
    onPressOpenDetail: (graph: { name: string }) => void;
  }) => {
    return (
      <View>
        <Text>{`graph:${graph.name}`}</Text>
        <Pressable
          onPress={() => {
            onPressAddToday(graph);
          }}
        >
          <Text>open-add-today</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onPressAddForDate(graph, "20260209");
          }}
        >
          <Text>open-add-for-date</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onPressOpenDetail(graph);
          }}
        >
          <Text>open-graph-detail</Text>
        </Pressable>
      </View>
    );
  };

  return { GraphCard };
});

const renderScreen = async () => {
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

  const screenInstance = render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <GraphListScreen />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
  await waitFor(() => {
    expect(mockLoadAuthCredentials).toHaveBeenCalled();
  });
  return screenInstance;
};

const credentials = {
  token: "token-1234",
  username: "demo-user",
};

const graph = {
  color: "sora",
  id: "sleep",
  name: "Sleep",
  timezone: "Asia/Tokyo",
  type: "float",
  unit: "hour",
} as const;

describe("GraphListScreen", () => {
  beforeAll(() => {
    const originalConsoleError = console.error;
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        const firstArg = args[0];
        if (
          typeof firstArg === "string" &&
          firstArg.includes("inside a test was not wrapped in act")
        ) {
          return;
        }
        originalConsoleError(...args);
      });
    notifyManager.setNotifyFunction((callback) => {
      act(() => {
        callback();
      });
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    notifyManager.setNotifyFunction((callback) => {
      callback();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetGraphs.mockResolvedValue([graph]);
    mockAddPixel.mockResolvedValue({
      isSuccess: true,
      message: "追加成功",
    });
    mockGetPixels.mockResolvedValue([]);
    mockToastShow.mockReset();
  });

  test("shows loading state while graph list is pending", async () => {
    const deferred = createDeferred<readonly [typeof graph]>();
    mockGetGraphs.mockImplementationOnce(() => deferred.promise);

    await renderScreen();

    expect(await screen.findByText("読み込み中...")).toBeTruthy();

    deferred.resolve([graph]);
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();
  });

  test("shows period label in list header", async () => {
    await renderScreen();

    expect(await screen.findByText("2025年11月 - 2026年2月")).toBeTruthy();
  });

  test("shows error state and allows retry", async () => {
    mockGetGraphs.mockRejectedValueOnce(new Error("取得失敗"));

    await renderScreen();

    expect(await screen.findByText("取得失敗")).toBeTruthy();
    fireEvent.press(screen.getByTestId("graph-list-retry-button"));

    await waitFor(() => {
      expect(mockGetGraphs).toHaveBeenCalledTimes(2);
    });
  });

  test("shows empty state when no graphs exist", async () => {
    mockGetGraphs.mockResolvedValueOnce([]);

    await renderScreen();

    expect(
      await screen.findByText("グラフがまだ登録されていません。")
    ).toBeTruthy();
  });

  test("shows validation error in quick add when quantity is empty", async () => {
    await renderScreen();

    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-add-today"));
    fireEvent.press(screen.getByTestId("graph-quick-add-save-button"));

    expect(
      await screen.findByText("数量は1以上の数値で入力してください")
    ).toBeTruthy();
  });

  test("shows top single missing item in today section", async () => {
    const today = getTodayAsYyyyMmDd();
    mockGetGraphs.mockResolvedValueOnce([
      graph,
      { ...graph, id: "fitness", name: "Fitness" },
    ]);
    mockGetPixels.mockImplementation(({ graphId }: { graphId: string }) => {
      if (graphId === "fitness") {
        return Promise.resolve([{ date: today, quantity: "2" }]);
      }
      return Promise.resolve([]);
    });

    await renderScreen();

    expect(await screen.findByText("Today 未入力")).toBeTruthy();
    expect(await screen.findByText("Sleep が未入力です")).toBeTruthy();
  });

  test("shows remaining missing count under top item", async () => {
    const today = getTodayAsYyyyMmDd();
    mockGetGraphs.mockResolvedValueOnce([
      graph,
      { ...graph, id: "fitness", name: "Fitness" },
      { ...graph, id: "reading", name: "Reading" },
    ]);
    mockGetPixels.mockImplementation(({ graphId }: { graphId: string }) => {
      if (graphId === "reading") {
        return Promise.resolve([{ date: today, quantity: "1" }]);
      }
      return Promise.resolve([]);
    });

    await renderScreen();

    expect(await screen.findByTestId("today-focus-card")).toBeTruthy();
    expect(await screen.findByTestId("today-focus-remaining")).toBeTruthy();
    expect(await screen.findByText("他1件未入力")).toBeTruthy();
  });

  test("redirects to auth screen when credentials are missing", async () => {
    mockLoadAuthCredentials.mockResolvedValue(null);

    await renderScreen();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  test("shows root error when quick add API fails", async () => {
    mockAddPixel.mockRejectedValueOnce(new Error("追加失敗"));

    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-add-today"));
    fireEvent.changeText(screen.getByPlaceholderText("10"), "3");
    fireEvent.press(screen.getByTestId("graph-quick-add-save-button"));

    expect(await screen.findByText("追加失敗")).toBeTruthy();
    expect(mockToastShow).not.toHaveBeenCalled();
  });

  test("shows HeroUI toast when quick add succeeds", async () => {
    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-add-today"));
    fireEvent.changeText(screen.getByPlaceholderText("10"), "3");
    fireEvent.press(screen.getByTestId("graph-quick-add-save-button"));

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        description: "追加成功",
        label: "記録を追加しました",
        variant: "success",
      });
    });
  });

  test("uses latest message for consecutive toast success calls", async () => {
    mockAddPixel
      .mockResolvedValueOnce({
        isSuccess: true,
        message: "1回目成功",
      })
      .mockResolvedValueOnce({
        isSuccess: true,
        message: "2回目成功",
      });

    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-add-today"));
    fireEvent.changeText(screen.getByPlaceholderText("10"), "3");
    fireEvent.press(screen.getByTestId("graph-quick-add-save-button"));
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith({
        description: "1回目成功",
        label: "記録を追加しました",
        variant: "success",
      });
    });

    fireEvent.press(screen.getByText("open-add-today"));
    fireEvent.changeText(screen.getByPlaceholderText("10"), "4");
    fireEvent.press(screen.getByTestId("graph-quick-add-save-button"));

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenLastCalledWith({
        description: "2回目成功",
        label: "記録を追加しました",
        variant: "success",
      });
    });
  });

  test("opens quick add with tapped date from heatmap cell", async () => {
    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-add-for-date"));
    expect(await screen.findByDisplayValue("20260209")).toBeTruthy();
  });

  test("today quick add button keeps current date as initial value", async () => {
    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByTestId("today-quick-add-button"));
    expect(await screen.findByDisplayValue(getTodayAsYyyyMmDd())).toBeTruthy();
  });

  test("navigates to graph detail from card", async () => {
    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-graph-detail"));
    expect(mockPush).toHaveBeenCalledWith({
      params: {
        color: "sora",
        graphId: "sleep",
        graphName: "Sleep",
        timezone: "Asia/Tokyo",
        unit: "hour",
      },
      pathname: "/graphs/[graphId]",
    });
  });

  test("does not show detailed input navigation in quick add", async () => {
    await renderScreen();
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();
    fireEvent.press(screen.getByText("open-add-today"));

    expect(screen.queryByText("詳細入力へ")).toBeNull();
  });
});
