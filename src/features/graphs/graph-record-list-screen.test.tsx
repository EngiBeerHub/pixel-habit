import { notifyManager } from "@tanstack/query-core";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { renderWithProviders } from "../../test-utils/render-with-providers";
import { GraphRecordListScreen } from "./graph-record-list-screen";

const mockGetPixels = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
let mockRouteParams: {
  graphId?: string;
  graphName?: string;
  unit?: string;
} = {
  graphId: "reading",
  graphName: "読書",
  unit: "Hour",
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
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

jest.mock("heroui-native", () => {
  const { Pressable, Text, View } = require("react-native");

  const Tabs = ({ children }: { children?: ReactNode }) => (
    <View>{children}</View>
  );
  Tabs.List = ({
    children,
    testID,
  }: {
    children?: ReactNode;
    testID?: string;
  }) => <View testID={testID}>{children}</View>;
  Tabs.Indicator = () => null;
  Tabs.Trigger = ({
    children,
    onPress,
    testID,
  }: {
    children?: ReactNode | ((props: { isSelected: boolean }) => ReactNode);
    onPress?: () => void;
    testID?: string;
  }) => (
    <Pressable onPress={onPress} testID={testID}>
      {typeof children === "function"
        ? children({ isSelected: false })
        : children}
    </Pressable>
  );
  Tabs.Label = ({ children }: { children?: ReactNode }) => (
    <Text>{children}</Text>
  );
  Tabs.Content = () => null;

  return {
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
    Card: Object.assign(
      ({ children }: { children?: ReactNode }) => <View>{children}</View>,
      {
        Body: ({ children }: { children?: ReactNode }) => (
          <View>{children}</View>
        ),
        Header: ({ children }: { children?: ReactNode }) => (
          <View>{children}</View>
        ),
        Title: ({ children }: { children?: ReactNode }) => (
          <Text>{children}</Text>
        ),
      }
    ),
    Tabs,
  };
});

const credentials = {
  token: "token-1234",
  username: "demo-user",
};

const renderScreen = () => {
  return renderWithProviders(<GraphRecordListScreen />, {
    withAuthSession: true,
  });
};

describe("GraphRecordListScreen", () => {
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
    jest.setSystemTime(new Date(2026, 2, 8, 12, 0, 0));
    mockRouteParams = {
      graphId: "reading",
      graphName: "読書",
      unit: "Hour",
    };
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockGetPixels.mockResolvedValue([
      {
        date: "20260308",
        optionalData: JSON.stringify({ memo: "朝に 30分 読書 / 集中できた" }),
        quantity: "20",
      },
      {
        date: "20260304",
        optionalData: JSON.stringify({ memo: "寝る前に 15分、途中でメモ追加" }),
        quantity: "15",
      },
      { date: "20260302", quantity: "12" },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("loads full range and configures a standard header title", async () => {
    renderScreen();

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith({
        headerLargeTitle: false,
        title: "読書",
      });
    });

    await waitFor(() => {
      expect(mockGetPixels).toHaveBeenCalledWith({
        from: "20250309",
        graphId: "reading",
        to: "20260308",
      });
    });
  });

  test("shows latest record and visible count", async () => {
    renderScreen();

    expect(
      await screen.findByTestId("graph-record-latest-date")
    ).toHaveTextContent("2026/03/08");
    expect(
      await screen.findByTestId("graph-record-visible-count")
    ).toHaveTextContent("3件");
    expect(await screen.findByTestId("graph-record-list")).toBeTruthy();
  });

  test("filters to memo-only records", async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId("graph-record-filter-memo"));

    expect(
      await screen.findByTestId("graph-record-visible-count")
    ).toHaveTextContent("2件");
    expect(screen.queryByTestId("graph-record-list-row-20260302")).toBeNull();
    expect(screen.getByTestId("graph-record-list-row-20260308")).toBeTruthy();
  });

  test("opens pixel detail when tapping a record row", async () => {
    renderScreen();

    fireEvent.press(
      await screen.findByTestId("graph-record-list-row-20260308")
    );

    expect(mockPush).toHaveBeenCalledWith({
      params: {
        date: "20260308",
        graphId: "reading",
        graphName: "読書",
        optionalData: JSON.stringify({ memo: "朝に 30分 読書 / 集中できた" }),
        quantity: "20",
      },
      pathname: "/graphs/[graphId]/pixels/[date]",
    });
  });
});
