import {
  clearApiAuthCredentials,
  getApiAuthCredentials,
  setApiAuthCredentials,
} from "./client-auth-context";

describe("client-auth-context", () => {
  beforeEach(() => {
    clearApiAuthCredentials();
  });

  test("returns null by default", () => {
    expect(getApiAuthCredentials()).toBeNull();
  });

  test("stores and returns credentials", () => {
    setApiAuthCredentials({
      token: "token-1234",
      username: "demo-user",
    });

    expect(getApiAuthCredentials()).toEqual({
      token: "token-1234",
      username: "demo-user",
    });
  });

  test("clears stored credentials", () => {
    setApiAuthCredentials({
      token: "token-1234",
      username: "demo-user",
    });

    clearApiAuthCredentials();
    expect(getApiAuthCredentials()).toBeNull();
  });
});
