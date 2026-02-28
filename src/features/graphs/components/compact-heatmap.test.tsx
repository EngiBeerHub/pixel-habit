import { fireEvent, render, screen } from "@testing-library/react-native";
import { CompactHeatmap, getCompactHeatmapDateRange } from "./compact-heatmap";

const parseYyyyMmDd = (value: string): Date => {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  return new Date(year, month, day);
};

describe("compact heatmap", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns date range aligned to Sunday-based week start", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 8, 10, 0, 0));

    const range = getCompactHeatmapDateRange(14);
    const fromDate = parseYyyyMmDd(range.from);

    expect(range.to).toBe("20260108");
    expect(range.from).toBe("20251005");
    expect(fromDate.getDay()).toBe(0);
  });

  test("renders weekday labels in compact mode", () => {
    render(
      <CompactHeatmap
        graphColor="sora"
        pixels={[
          { date: "20260101", quantity: "2" },
          { date: "20260103", quantity: "1" },
          { date: "20260104", quantity: "x" },
        ]}
        weeks={14}
      />
    );

    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Wed")).toBeTruthy();
    expect(screen.getByText("Fri")).toBeTruthy();
  });

  test("calls onPressCell when past date cell is tapped", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 8, 10, 0, 0));
    const onPressCell = jest.fn();

    render(
      <CompactHeatmap
        graphColor="sora"
        onPressCell={onPressCell}
        pixels={[{ date: "20260107", quantity: "2" }]}
        weeks={14}
      />
    );

    fireEvent.press(screen.getByTestId("compact-heatmap-cell-20260107"));
    expect(onPressCell).toHaveBeenCalledWith("20260107");
  });

  test("does not call onPressCell when future date cell is tapped", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 8, 10, 0, 0));
    const onPressCell = jest.fn();

    render(
      <CompactHeatmap
        graphColor="sora"
        onPressCell={onPressCell}
        pixels={[{ date: "20260107", quantity: "2" }]}
        weeks={14}
      />
    );

    fireEvent.press(screen.getByTestId("compact-heatmap-cell-20260110"));
    expect(onPressCell).not.toHaveBeenCalled();
  });

  test("marks future date cell as disabled for accessibility", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 8, 10, 0, 0));

    render(
      <CompactHeatmap
        graphColor="sora"
        onPressCell={jest.fn()}
        pixels={[{ date: "20260107", quantity: "2" }]}
        weeks={14}
      />
    );

    expect(screen.getByTestId("compact-heatmap-cell-20260110")).toHaveProp(
      "accessibilityState",
      { disabled: true }
    );
  });
});
