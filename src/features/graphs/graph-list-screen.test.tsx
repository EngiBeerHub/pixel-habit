import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";
import { GraphListScreen } from "./graph-list-screen";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockGetGraphs = jest.fn();
const mockLoadAuthCredentials = jest.fn();

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
  getGraphStats: jest.fn(),
}));

jest.mock("../../shared/api/pixel", () => ({
  addPixel: jest.fn(),
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { TextInput, View } = require("react-native");

  const BottomSheet = React.forwardRef(
    ({ children }: { children: ReactNode }, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({
        close: jest.fn(),
        snapToIndex: jest.fn(),
      }));

      return <View>{children}</View>;
    }
  );

  const BottomSheetBackdrop = () => null;
  const BottomSheetTextInput = ({ ...props }) => <TextInput {...props} />;
  const BottomSheetView = ({ children }: { children: ReactNode }) => {
    return <View>{children}</View>;
  };

  return {
    __esModule: true,
    BottomSheetBackdrop,
    BottomSheetTextInput,
    BottomSheetView,
    default: BottomSheet,
  };
});

jest.mock("./components/graph-card", () => {
  const { Pressable, Text, View } = require("react-native");

  const GraphCard = ({
    graph,
    onPressAddPixel,
    viewMode,
  }: {
    graph: { name: string };
    onPressAddPixel: (graph: { name: string }) => void;
    viewMode: string;
  }) => {
    return (
      <View>
        <Text>{`graph:${graph.name}`}</Text>
        <Text>{`mode:${viewMode}`}</Text>
        <Pressable
          onPress={() => {
            onPressAddPixel(graph);
          }}
        >
          <Text>open-quick-add</Text>
        </Pressable>
      </View>
    );
  };

  return { GraphCard };
});

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
      <GraphListScreen />
    </QueryClientProvider>
  );
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetGraphs.mockResolvedValue([graph]);
  });

  test("shows loading state while graph list is pending", async () => {
    const deferred = createDeferred<readonly [typeof graph]>();
    mockGetGraphs.mockImplementationOnce(() => deferred.promise);

    renderScreen();

    expect(await screen.findByText("読み込み中...")).toBeTruthy();

    deferred.resolve([graph]);
    expect(await screen.findByText("graph:Sleep")).toBeTruthy();
  });

  test("shows error state and allows retry", async () => {
    mockGetGraphs.mockRejectedValueOnce(new Error("取得失敗"));

    renderScreen();

    expect(await screen.findByText("取得失敗")).toBeTruthy();
    fireEvent.press(screen.getByText("再試行"));

    await waitFor(() => {
      expect(mockGetGraphs).toHaveBeenCalledTimes(2);
    });
  });

  test("shows empty state when no graphs exist", async () => {
    mockGetGraphs.mockResolvedValueOnce([]);

    renderScreen();

    expect(
      await screen.findByText("グラフがまだ登録されていません。")
    ).toBeTruthy();
  });

  test("switches between compact and full modes", async () => {
    renderScreen();

    expect(await screen.findByText("mode:compact")).toBeTruthy();

    fireEvent.press(screen.getByText("Full"));

    expect(await screen.findByText("mode:full")).toBeTruthy();
  });

  test("shows validation error in quick add when quantity is empty", async () => {
    renderScreen();

    expect(await screen.findByText("graph:Sleep")).toBeTruthy();

    fireEvent.press(screen.getByText("open-quick-add"));
    fireEvent.press(screen.getByText("保存"));

    expect(
      await screen.findByText("数量は0以上の数値で入力してください")
    ).toBeTruthy();
  });
});
