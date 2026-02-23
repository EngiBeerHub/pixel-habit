import type { QueryClient } from "@tanstack/react-query";
import {
  invalidateGraphRelatedQueries,
  invalidatePixelRelatedQueries,
  refetchCompactHeatmapQueries,
} from "./invalidation";
import { queryKeys } from "./query-keys";

describe("invalidation helpers", () => {
  test("invalidates graph related query keys", async () => {
    const invalidateQueries = jest.fn().mockResolvedValue(undefined);
    const queryClient = {
      invalidateQueries,
    } as unknown as QueryClient;

    await invalidateGraphRelatedQueries(queryClient, "demo-user");

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphs("demo-user"),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphDetailPixelsAll(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphPixelsCompactAll(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphPixelsToday("demo-user"),
    });
  });

  test("refetches compact heatmap queries by username", async () => {
    const refetchQueries = jest.fn().mockResolvedValue(undefined);
    const queryClient = {
      refetchQueries,
    } as unknown as QueryClient;

    await refetchCompactHeatmapQueries(queryClient, "demo-user");

    expect(refetchQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphPixelsCompactByUser("demo-user"),
      type: "active",
    });
  });

  test("invalidates pixel related query keys", async () => {
    const invalidateQueries = jest.fn().mockResolvedValue(undefined);
    const queryClient = {
      invalidateQueries,
    } as unknown as QueryClient;

    await invalidatePixelRelatedQueries(queryClient, "demo-user");

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphDetailPixelsAll(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphPixelsCompactAll(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.graphPixelsToday("demo-user"),
    });
  });
});
