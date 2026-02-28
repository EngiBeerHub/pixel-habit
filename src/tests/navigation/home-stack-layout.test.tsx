import { render } from "@testing-library/react-native";
import HomeStackLayout from "../../app/(tabs)/home/_layout";

const mockPush = jest.fn();
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

  return {
    Stack,
    useRouter: () => ({
      push: mockPush,
    }),
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("HomeStackLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("applies large title at screen level instead of global stack default", () => {
    render(<HomeStackLayout />);

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
    expect(indexScreenInput.name).toBe("index");
    expect(indexScreenInput.options).toEqual(
      expect.objectContaining({
        headerLargeTitle: true,
        title: "Habits",
      })
    );
  });

  test("keeps single header add action routing to create screen", () => {
    render(<HomeStackLayout />);

    const indexScreenInput = mockStackScreenProps.mock.calls[0]?.[0] as {
      options: {
        headerRight: () => React.ReactElement;
      };
    };
    const headerRight = indexScreenInput.options.headerRight;
    const headerRightElement = headerRight();
    headerRightElement.props.onPress();

    expect(mockPush).toHaveBeenCalledWith("/graphs/create");
  });
});
