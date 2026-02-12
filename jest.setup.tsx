import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => {
  return require("react-native-reanimated/mock");
});

jest.mock("heroui-native");
