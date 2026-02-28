import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { GraphListScreen } from "./graph-list-screen";

const mockUseGraphListScreen = jest.fn();

jest.mock("./hooks/use-graph-list-screen", () => ({
  useGraphListScreen: () => mockUseGraphListScreen(),
}));

jest.mock("./components/graph-card", () => ({
  GraphCard: ({ graph }: { graph: { name: string } }) => {
    const { Text } = require("react-native");
    return <Text>{`graph:${graph.name}`}</Text>;
  },
}));

jest.mock("./components/graph-list-states", () => ({
  GraphListStates: ({ mode }: { mode: string }) => {
    const { Text } = require("react-native");
    return <Text>{`state:${mode}`}</Text>;
  },
}));

jest.mock("./components/quick-add-sheet", () => ({
  QuickAddSheet: ({ children }: { children?: ReactNode }) => children ?? null,
}));

describe("GraphListScreen loading behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("keeps graph list visible when cached data exists during loading", () => {
    mockUseGraphListScreen.mockReturnValue({
      addPixelMutation: { isPending: false },
      api: { isAuthenticated: true },
      control: {},
      errorMessage: null,
      isGraphListLoading: true,
      isPullRefreshing: false,
      isQuickAddOpen: false,
      onPressAddForDate: jest.fn(),
      onPressAddToday: jest.fn(),
      onPressOpenDetail: jest.fn(),
      onQuickAddOpenChange: jest.fn(),
      onRefresh: jest.fn(),
      onRetry: jest.fn(),
      onSubmitQuickAdd: jest.fn(),
      pixelFormErrors: {},
      query: {
        data: [
          {
            color: "sora",
            id: "sleep",
            name: "Sleep",
            timezone: "Asia/Tokyo",
            type: "float",
            unit: "hour",
          },
        ],
      },
      selectedGraph: null,
    });

    render(<GraphListScreen />);

    expect(screen.getByText("graph:Sleep")).toBeTruthy();
    expect(screen.queryByText("state:loading")).toBeNull();
  });
});
