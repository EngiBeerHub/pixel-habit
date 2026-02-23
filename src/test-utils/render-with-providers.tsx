import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";
import { AuthSessionProvider } from "../shared/auth/auth-session-context";

/**
 * テスト向けQueryClientを生成する。
 */
export const createTestQueryClient = () => {
  return new QueryClient({
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
};

/**
 * 共通Provider付きで画面を描画する。
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withAuthSession = false,
    ...options
  }: RenderOptions & {
    queryClient?: QueryClient;
    withAuthSession?: boolean;
  } = {}
) => {
  const Wrapper = ({ children }: { children?: ReactNode }) => {
    if (withAuthSession) {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </QueryClientProvider>
      );
    }

    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  return {
    queryClient,
    ...render(ui, {
      wrapper: Wrapper,
      ...options,
    }),
  };
};
