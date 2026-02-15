import { notifyManager } from "@tanstack/query-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";
import { PixelDetailScreen } from "./pixel-detail-screen";

const mockBack = jest.fn();
const mockUpdatePixel = jest.fn();
const mockDeletePixel = jest.fn();
const mockUseAuthedPixelaApi = jest.fn();
const mockShowAlert = jest.fn();
let mockRouteParams: {
  date?: string;
  graphId?: string;
  graphName?: string;
  optionalData?: string;
  quantity?: string;
} = {
  date: "20260108",
  graphId: "sleep",
  graphName: "Sleep",
  optionalData: "就寝前にストレッチ",
  quantity: "2",
};

interface AlertButton {
  onPress?: () => void;
  text?: string;
}

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockRouteParams,
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("../../shared/api/authed-pixela-api", () => ({
  useAuthedPixelaApi: (...args: unknown[]) => mockUseAuthedPixelaApi(...args),
}));

jest.mock("../../shared/platform/app-alert", () => ({
  showAlert: (...args: unknown[]) => mockShowAlert(...args),
}));

jest.mock("heroui-native", () => {
  const { Pressable, Text, TextInput } = require("react-native");

  return {
    Button: ({
      children,
      onPress,
    }: {
      children?: ReactNode;
      onPress?: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    ),
    Input: ({
      onBlur,
      onChangeText,
      placeholder,
      testID,
      value,
    }: {
      onBlur?: () => void;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      testID?: string;
      value?: string;
    }) => (
      <TextInput
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />
    ),
    TextArea: ({
      onBlur,
      onChangeText,
      placeholder,
      testID,
      value,
    }: {
      onBlur?: () => void;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      testID?: string;
      value?: string;
    }) => (
      <TextInput
        multiline
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />
    ),
  };
});

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
      <PixelDetailScreen />
    </QueryClientProvider>
  );
};

describe("PixelDetailScreen", () => {
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
    mockUpdatePixel.mockResolvedValue({
      isSuccess: true,
      message: "更新成功",
    });
    mockDeletePixel.mockResolvedValue({
      isSuccess: true,
      message: "削除成功",
    });
    mockUseAuthedPixelaApi.mockReturnValue({
      deletePixel: (...args: unknown[]) => mockDeletePixel(...args),
      updatePixel: (...args: unknown[]) => mockUpdatePixel(...args),
    });
    mockRouteParams = {
      date: "20260108",
      graphId: "sleep",
      graphName: "Sleep",
      optionalData: "就寝前にストレッチ",
      quantity: "2",
    };
    mockShowAlert.mockImplementation(() => undefined);
  });

  test("shows validation error when quantity is empty", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "");
    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText("数量は1以上の数値で入力してください")
    ).toBeTruthy();
  });

  test("updates pixel, shows completion alert, and returns", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "5");
    fireEvent.changeText(
      screen.getByTestId("pixel-detail-optional-data-input"),
      "朝ラン30分"
    );
    fireEvent.press(screen.getByText("更新"));

    await waitFor(() => {
      expect(mockUpdatePixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
        optionalData: "朝ラン30分",
        quantity: "5",
      });
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      "更新完了",
      "更新成功",
      expect.any(Array)
    );
    const completionButtons = mockShowAlert.mock.calls[0]?.[2] as
      | AlertButton[]
      | undefined;
    const okButton = completionButtons?.find((button) => button.text === "OK");
    okButton?.onPress?.();
    expect(mockBack).toHaveBeenCalled();
  });

  test("deletes pixel after confirmation", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("削除"));

    const confirmButtons = mockShowAlert.mock.calls[0]?.[2] as
      | AlertButton[]
      | undefined;
    const deleteConfirmButton = confirmButtons?.find(
      (button) => button.text === "削除する"
    );

    deleteConfirmButton?.onPress?.();

    await waitFor(() => {
      expect(mockDeletePixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
      });
    });

    const completionButtons = mockShowAlert.mock.calls[1]?.[2] as
      | AlertButton[]
      | undefined;
    const okButton = completionButtons?.find((button) => button.text === "OK");
    okButton?.onPress?.();

    expect(mockBack).toHaveBeenCalled();
  });

  test("shows auth error when credentials are missing on update", async () => {
    mockUpdatePixel.mockRejectedValueOnce(
      new Error("認証情報が見つかりません。再ログインしてください。")
    );

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "5");
    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText(
        "認証情報が見つかりません。再ログインしてください。"
      )
    ).toBeTruthy();
  });

  test("shows optionalData as initial value", () => {
    renderScreen();

    expect(screen.getByDisplayValue("就寝前にストレッチ")).toBeTruthy();
  });

  test("updates pixel with multiline optionalData", async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText("10"), "6");
    fireEvent.changeText(
      screen.getByTestId("pixel-detail-optional-data-input"),
      "朝ラン\n夜ストレッチ"
    );
    fireEvent.press(screen.getByText("更新"));

    await waitFor(() => {
      expect(mockUpdatePixel).toHaveBeenCalledWith({
        date: "20260108",
        graphId: "sleep",
        optionalData: "朝ラン\n夜ストレッチ",
        quantity: "6",
      });
    });
  });

  test("shows graph/date error when route params are invalid", async () => {
    mockRouteParams = {
      graphId: "sleep",
      graphName: "Sleep",
      quantity: "2",
    };

    renderScreen();

    fireEvent.press(screen.getByText("更新"));

    expect(
      await screen.findByText("graphIdまたはdateが不正です。")
    ).toBeTruthy();
  });
});
