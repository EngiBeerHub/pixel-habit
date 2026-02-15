import { fireEvent, render, screen } from "@testing-library/react-native";
import type { GraphDefinition } from "../../../shared/api/graph";
import { GraphCard } from "./graph-card";

const METADATA_ID_PATTERN = /ID:/;
const METADATA_UNIT_PATTERN = /単位:/;
const METADATA_TIMEZONE_PATTERN = /タイムゾーン/;

const mockUseQuery = jest.fn();
const mockRefetch = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock("../../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("./compact-heatmap", () => ({
  CompactHeatmap: ({
    onPressCell,
  }: {
    onPressCell?: (date: string) => void;
  }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable
        onPress={() => {
          onPressCell?.("20260103");
        }}
      >
        <Text>COMPACT_HEATMAP</Text>
      </Pressable>
    );
  },
  getCompactHeatmapDateRange: () => ({ from: "20251005", to: "20260108" }),
}));

const graph: GraphDefinition = {
  color: "sora",
  id: "sleep",
  name: "Sleep",
  timezone: "Asia/Tokyo",
  type: "float",
  unit: "hour",
};

const buildProps = () => ({
  graph,
  isActionDisabled: false,
  onPressAddForDate: jest.fn(),
  onPressAddToday: jest.fn(),
  onPressOpenDetail: jest.fn(),
});

describe("GraphCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthedPixelaApi.mockReturnValue({
      getPixels: jest.fn(),
      isAuthenticated: true,
      username: "user",
    });
    mockUseQuery.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    });
  });

  test("renders loading state", () => {
    mockUseQuery.mockReturnValueOnce({
      data: undefined,
      error: null,
      isLoading: true,
      refetch: mockRefetch,
    });

    render(<GraphCard {...buildProps()} />);

    expect(screen.getByText("記録を読み込み中...")).toBeTruthy();
  });

  test("renders error state and retries", () => {
    mockUseQuery.mockReturnValueOnce({
      data: undefined,
      error: new Error("failed"),
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<GraphCard {...buildProps()} />);

    expect(screen.getByText("ヒートマップの取得に失敗しました。")).toBeTruthy();
    fireEvent.press(screen.getByText("再取得"));
    expect(mockRefetch).toHaveBeenCalled();
  });

  test("renders heatmap on success", () => {
    mockUseQuery.mockReturnValueOnce({
      data: [{ date: "20260101", quantity: "2" }],
      error: null,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<GraphCard {...buildProps()} />);

    expect(screen.getByText("COMPACT_HEATMAP")).toBeTruthy();
  });

  test("triggers add today action from + button", () => {
    const props = buildProps();

    render(<GraphCard {...props} />);
    fireEvent.press(screen.getByTestId("graph-card-add-today-sleep"));

    expect(props.onPressAddToday).toHaveBeenCalledWith(graph);
  });

  test("triggers detail action from card header", () => {
    const props = buildProps();

    render(<GraphCard {...props} />);
    fireEvent.press(screen.getByTestId("graph-card-open-detail-sleep"));

    expect(props.onPressOpenDetail).toHaveBeenCalledWith(graph);
  });

  test("does not render stats summary as always-visible content", () => {
    render(<GraphCard {...buildProps()} />);

    expect(screen.queryByText("総記録数")).toBeNull();
    expect(screen.queryByText("合計")).toBeNull();
  });

  test("does not render metadata lines on home card", () => {
    render(<GraphCard {...buildProps()} />);

    expect(screen.queryByText(METADATA_ID_PATTERN)).toBeNull();
    expect(screen.queryByText(METADATA_UNIT_PATTERN)).toBeNull();
    expect(screen.queryByText(METADATA_TIMEZONE_PATTERN)).toBeNull();
  });

  test("calls add for date when a heatmap cell is tapped", () => {
    const props = buildProps();

    render(<GraphCard {...props} />);
    fireEvent.press(screen.getByText("COMPACT_HEATMAP"));

    expect(props.onPressAddForDate).toHaveBeenCalledWith(graph, "20260103");
  });
});
