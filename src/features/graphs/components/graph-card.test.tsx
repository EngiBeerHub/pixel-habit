import { fireEvent, render, screen } from "@testing-library/react-native";
import type { GraphDefinition } from "../../../shared/api/graph";
import { GraphCard } from "./graph-card";

const mockUseQuery = jest.fn();
const mockRefetch = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock("../../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

jest.mock("./compact-heatmap", () => ({
  CompactHeatmap: () => {
    const { Text } = require("react-native");
    return <Text>COMPACT_HEATMAP</Text>;
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
  onPressAddPixel: jest.fn(),
  onPressOpenDetail: jest.fn(),
  onPressGraphMenu: jest.fn(),
  onPressOpenPixels: jest.fn(),
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

  test("triggers quick add and pixel list actions", () => {
    const props = buildProps();

    render(<GraphCard {...props} />);
    fireEvent.press(screen.getByText("記録する"));
    fireEvent.press(screen.getByText("記録一覧"));
    expect(props.onPressAddPixel).toHaveBeenCalledWith(graph);
    expect(props.onPressOpenPixels).toHaveBeenCalledWith(graph);
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
});
