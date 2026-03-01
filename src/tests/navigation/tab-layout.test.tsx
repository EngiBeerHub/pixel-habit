import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import TabLayout from "../../app/(tabs)/_layout";

const mockNativeTabsProps = jest.fn();
const mockNativeTabTrigger = jest.fn();
const mockIcon = jest.fn();

jest.mock("expo-router/unstable-native-tabs", () => {
  const { Text, View } = require("react-native");

  const NativeTabs = ({
    children,
    ...props
  }: {
    children?: ReactNode;
    backBehavior?: string;
  }) => {
    mockNativeTabsProps(props);
    return <View testID="native-tabs">{children}</View>;
  };

  NativeTabs.Trigger = ({
    children,
    name,
  }: {
    children?: ReactNode;
    name: string;
  }) => {
    mockNativeTabTrigger(name);
    return <View testID={`native-tab-trigger-${name}`}>{children}</View>;
  };

  return {
    Icon: (props: unknown) => {
      mockIcon(props);
      return <View testID="native-tab-icon" />;
    },
    Label: ({ children }: { children?: ReactNode }) => <Text>{children}</Text>,
    NativeTabs,
    VectorIcon: ({ name }: { name: string }) => (
      <View testID={`native-tab-vector-icon-${name}`} />
    ),
  };
});

describe("TabLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses Native Tabs with Habits/Settings trigger labels", () => {
    render(<TabLayout />);

    expect(screen.getByTestId("native-tabs")).toBeTruthy();
    expect(screen.getByTestId("native-tab-trigger-home")).toBeTruthy();
    expect(screen.getByTestId("native-tab-trigger-settings")).toBeTruthy();
    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(mockNativeTabTrigger).toHaveBeenNthCalledWith(1, "home");
    expect(mockNativeTabTrigger).toHaveBeenNthCalledWith(2, "settings");
  });

  test("keeps tab navigation context with history back behavior", () => {
    render(<TabLayout />);

    expect(mockNativeTabsProps).toHaveBeenCalledWith(
      expect.objectContaining({
        backBehavior: "history",
      })
    );
  });

  test("defines selected/unselected icon states for both tabs", () => {
    render(<TabLayout />);

    expect(mockIcon).toHaveBeenCalledTimes(2);
    expect(mockIcon).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sf: { default: "square.grid.2x2", selected: "square.grid.2x2.fill" },
      })
    );
    expect(mockIcon).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sf: { default: "gearshape", selected: "gearshape.fill" },
      })
    );
  });

  test("defines Android icon states for both tabs", () => {
    render(<TabLayout />);

    expect(mockIcon).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        androidSrc: expect.objectContaining({
          default: expect.objectContaining({
            props: expect.objectContaining({
              name: "grid-outline",
            }),
          }),
          selected: expect.objectContaining({
            props: expect.objectContaining({
              name: "grid",
            }),
          }),
        }),
      })
    );
    expect(mockIcon).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        androidSrc: expect.objectContaining({
          default: expect.objectContaining({
            props: expect.objectContaining({
              name: "settings-outline",
            }),
          }),
          selected: expect.objectContaining({
            props: expect.objectContaining({
              name: "settings",
            }),
          }),
        }),
      })
    );
  });
});
