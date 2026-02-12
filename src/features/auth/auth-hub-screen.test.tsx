import { fireEvent, render, screen } from "@testing-library/react-native";
import { AuthHubScreen } from "./auth-hub-screen";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("AuthHubScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("navigates to sign-in screen", () => {
    render(<AuthHubScreen />);

    fireEvent.press(screen.getByText("ログイン"));

    expect(mockPush).toHaveBeenCalledWith("/auth/sign-in");
  });

  test("navigates to sign-up screen", () => {
    render(<AuthHubScreen />);

    fireEvent.press(screen.getByText("アカウント作成"));

    expect(mockPush).toHaveBeenCalledWith("/auth/sign-up");
  });
});
