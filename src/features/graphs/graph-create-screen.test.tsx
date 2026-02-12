import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { GraphCreateScreen } from "./graph-create-screen";

const mockBack = jest.fn();
const mockCreateGraph = jest.fn();
const mockLoadAuthCredentials = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/api/graph", () => ({
  createGraph: (...args: unknown[]) => mockCreateGraph(...args),
  graphColorOptions: ["shibafu", "sora"],
  graphTypeOptions: ["int", "float"],
}));

jest.mock("../../shared/storage/auth-storage", () => ({
  loadAuthCredentials: (...args: unknown[]) => mockLoadAuthCredentials(...args),
}));

const credentials = {
  token: "token-1234",
  username: "demo-user",
};

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
      <GraphCreateScreen />
    </QueryClientProvider>
  );
};

describe("GraphCreateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAuthCredentials.mockResolvedValue(credentials);
    mockCreateGraph.mockResolvedValue({
      isSuccess: true,
      message: "作成成功",
    });
  });

  test("shows validation errors when required fields are empty", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("作成"));

    expect(
      await screen.findByText(
        "idは英小文字で始まり、英小文字/数字/-で2〜17文字です"
      )
    ).toBeTruthy();
    expect(await screen.findByText("グラフ名は必須です")).toBeTruthy();
    expect(await screen.findByText("単位は必須です")).toBeTruthy();
  });

  test("shows API error message on create failure", async () => {
    mockCreateGraph.mockRejectedValueOnce(new Error("作成失敗"));

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("habit-graph"), "habit-1");
    fireEvent.changeText(screen.getByPlaceholderText("読書"), "Habit");
    fireEvent.changeText(screen.getByPlaceholderText("page"), "count");
    fireEvent.press(screen.getByText("作成"));

    expect(await screen.findByText("作成失敗")).toBeTruthy();
  });

  test("shows fallback error when create rejects non-Error", async () => {
    mockCreateGraph.mockRejectedValueOnce("unknown error");

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("habit-graph"), "habit-1");
    fireEvent.changeText(screen.getByPlaceholderText("読書"), "Habit");
    fireEvent.changeText(screen.getByPlaceholderText("page"), "count");
    fireEvent.press(screen.getByText("作成"));

    expect(
      await screen.findByText("グラフ作成に失敗しました。再度お試しください。")
    ).toBeTruthy();
  });

  test("shows auth error when credentials are missing", async () => {
    mockLoadAuthCredentials.mockResolvedValueOnce(null);

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("habit-graph"), "habit-1");
    fireEvent.changeText(screen.getByPlaceholderText("読書"), "Habit");
    fireEvent.changeText(screen.getByPlaceholderText("page"), "count");
    fireEvent.press(screen.getByText("作成"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("creates graph and navigates back on success", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("habit-graph"), "habit-1");
    fireEvent.changeText(screen.getByPlaceholderText("読書"), "Habit");
    fireEvent.changeText(screen.getByPlaceholderText("page"), "count");
    fireEvent.press(screen.getByText("作成"));

    await waitFor(() => {
      expect(mockCreateGraph).toHaveBeenCalledWith({
        color: "shibafu",
        id: "habit-1",
        name: "Habit",
        timezone: "Asia/Tokyo",
        token: "token-1234",
        type: "int",
        unit: "count",
        username: "demo-user",
      });
    });

    expect(mockBack).toHaveBeenCalled();
  });
});
