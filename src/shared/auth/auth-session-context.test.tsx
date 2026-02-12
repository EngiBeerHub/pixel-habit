import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text, View } from "react-native";
import type { AuthCredentials } from "../storage/auth-storage";
import { AuthSessionProvider } from "./auth-session-context";
import { useAuthSession } from "./use-auth-session";

const mockClearAuthCredentials = jest.fn();
const mockLoadAuthCredentials = jest.fn();
const mockSaveAuthCredentials = jest.fn();

jest.mock("../storage/auth-storage", () => ({
  clearAuthCredentials: (...args: unknown[]) =>
    mockClearAuthCredentials(...args),
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
  saveAuthCredentials: (...args: unknown[]) => mockSaveAuthCredentials(...args),
}));

/**
 * 認証状態の遷移を確認するためのテスト用コンシューマ。
 */
const AuthSessionConsumer = () => {
  const {
    clearAuthSession,
    credentials,
    refreshAuthSession,
    setAuthSession,
    status,
  } = useAuthSession();
  return (
    <View>
      <Text testID="auth-status">{status}</Text>
      <Text testID="auth-username">{credentials?.username ?? "-"}</Text>
      <Text
        onPress={() => {
          setAuthSession({
            token: "token-next",
            username: "demo-next",
          });
        }}
        testID="set-auth-session"
      >
        set-auth-session
      </Text>
      <Text
        onPress={() => {
          clearAuthSession();
        }}
        testID="clear-auth-session"
      >
        clear-auth-session
      </Text>
      <Text
        onPress={() => {
          refreshAuthSession();
        }}
        testID="refresh-auth-session"
      >
        refresh-auth-session
      </Text>
    </View>
  );
};

/**
 * Query + AuthSession Provider 付きでコンシューマを描画する。
 */
const renderWithProvider = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Number.POSITIVE_INFINITY,
        retry: false,
      },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <AuthSessionConsumer />
      </AuthSessionProvider>
    </QueryClientProvider>
  );
};

describe("AuthSessionProvider", () => {
  let storedCredentials: AuthCredentials | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    storedCredentials = null;
    mockLoadAuthCredentials.mockImplementation(async () => storedCredentials);
    mockSaveAuthCredentials.mockImplementation(
      (credentials: AuthCredentials) => {
        storedCredentials = credentials;
      }
    );
    mockClearAuthCredentials.mockImplementation(() => {
      storedCredentials = null;
    });
  });

  test("changes status from loading to authenticated", async () => {
    storedCredentials = { token: "token-1", username: "demo-user" };

    renderWithProvider();

    expect(screen.getByTestId("auth-status").props.children).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "authenticated"
      );
      expect(screen.getByTestId("auth-username").props.children).toBe(
        "demo-user"
      );
    });
  });

  test("changes status from loading to anonymous", async () => {
    renderWithProvider();

    expect(screen.getByTestId("auth-status").props.children).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "anonymous"
      );
      expect(screen.getByTestId("auth-username").props.children).toBe("-");
    });
  });

  test("setAuthSession saves credentials and updates state", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "anonymous"
      );
    });

    fireEvent.press(screen.getByTestId("set-auth-session"));

    await waitFor(() => {
      expect(mockSaveAuthCredentials).toHaveBeenCalledWith({
        token: "token-next",
        username: "demo-next",
      });
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "authenticated"
      );
      expect(screen.getByTestId("auth-username").props.children).toBe(
        "demo-next"
      );
    });
  });

  test("clearAuthSession clears credentials and updates state", async () => {
    storedCredentials = { token: "token-1", username: "demo-user" };

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "authenticated"
      );
    });

    fireEvent.press(screen.getByTestId("clear-auth-session"));

    await waitFor(() => {
      expect(mockClearAuthCredentials).toHaveBeenCalled();
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "anonymous"
      );
      expect(screen.getByTestId("auth-username").props.children).toBe("-");
    });
  });

  test("refreshAuthSession refetches credentials", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "anonymous"
      );
    });

    storedCredentials = { token: "token-refresh", username: "demo-refresh" };
    fireEvent.press(screen.getByTestId("refresh-auth-session"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").props.children).toBe(
        "authenticated"
      );
      expect(screen.getByTestId("auth-username").props.children).toBe(
        "demo-refresh"
      );
    });
  });
});
