import {
  deserializeOptionalData,
  serializeOptionalData,
  toOptionalMemoPreview,
} from "./optional-data";

describe("optional data helpers", () => {
  test("serializes memo text as json string", () => {
    expect(serializeOptionalData("  memo text  ")).toBe('{"memo":"memo text"}');
  });

  test("omits empty memo text", () => {
    expect(serializeOptionalData("   ")).toBeUndefined();
    expect(serializeOptionalData(undefined)).toBeUndefined();
  });

  test("deserializes json payload to memo text", () => {
    expect(
      deserializeOptionalData('{"memo":"  朝ラン\\n夜ストレッチ  "}')
    ).toBe("朝ラン\n夜ストレッチ");
  });

  test("keeps legacy and invalid json text for backward compatibility", () => {
    expect(deserializeOptionalData("legacy memo")).toBe("legacy memo");
    expect(deserializeOptionalData("{invalid-json")).toBe("{invalid-json");
  });

  test("builds one line preview from multiline memo", () => {
    expect(toOptionalMemoPreview("朝ラン\n夜ストレッチ", 8)).toBe(
      "朝ラン 夜ストレ…"
    );
  });

  test("returns null when preview source is empty", () => {
    expect(toOptionalMemoPreview("    ", 24)).toBeNull();
    expect(toOptionalMemoPreview(undefined, 24)).toBeNull();
  });
});
