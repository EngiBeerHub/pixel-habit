import { render } from "@testing-library/react-native";
import SettingsStackLayout from "../../app/(tabs)/settings/_layout";

const mockStackProps = jest.fn();
const mockStackScreenProps = jest.fn();

jest.mock("expo-router", () => {
  const { View } = require("react-native");

  const Stack = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    screenOptions?: Record<string, unknown>;
  }) => {
    mockStackProps(props);
    return <View>{children}</View>;
  };

  Stack.Screen = (props: unknown) => {
    mockStackScreenProps(props);
    return null;
  };

  return { Stack };
});

describe("SettingsStackLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("applies large title policy per screen", () => {
    render(<SettingsStackLayout />);

    const stackInput = mockStackProps.mock.calls[0]?.[0] as {
      screenOptions?: Record<string, unknown>;
    };
    expect(stackInput.screenOptions).toEqual(
      expect.objectContaining({
        headerShadowVisible: false,
      })
    );
    expect(stackInput.screenOptions).not.toHaveProperty("headerLargeTitle");

    const indexScreenInput = mockStackScreenProps.mock.calls[0]?.[0] as {
      name: string;
      options: Record<string, unknown>;
    };
    const tokenScreenInput = mockStackScreenProps.mock.calls[1]?.[0] as {
      name: string;
      options: Record<string, unknown>;
    };

    expect(indexScreenInput.name).toBe("index");
    expect(indexScreenInput.options).toEqual(
      expect.objectContaining({
        headerLargeTitle: true,
        title: "Settings",
      })
    );

    expect(tokenScreenInput.name).toBe("token");
    expect(tokenScreenInput.options).toEqual(
      expect.objectContaining({
        headerLargeTitle: false,
        title: "トークン変更",
      })
    );
  });
});
