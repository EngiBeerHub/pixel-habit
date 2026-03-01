import {
  nativeTabRequirementTestMapping,
  validateRequirementTestMapping,
} from "./requirement-test-mapping";

describe("validateRequirementTestMapping", () => {
  test("covers all requirement IDs from 1.1 to 6.3", () => {
    const expectedIds = [
      "1.1",
      "1.2",
      "1.3",
      "1.4",
      "1.5",
      "2.1",
      "2.2",
      "2.3",
      "2.4",
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "5.1",
      "5.2",
      "5.3",
      "6.1",
      "6.2",
      "6.3",
    ];
    const actualIds = nativeTabRequirementTestMapping
      .map((entry) => entry.requirementId)
      .sort();

    expect(actualIds).toEqual(expectedIds);
  });

  test("returns no errors for native tab requirement mapping", () => {
    expect(
      validateRequirementTestMapping(nativeTabRequirementTestMapping)
    ).toEqual([]);
  });

  test("detects duplicated requirement IDs", () => {
    const errors = validateRequirementTestMapping([
      {
        requirementId: "1.1",
        testCases: ["tab-layout NativeTabs trigger labels"],
        testSuite: "src/tests/navigation/tab-layout.test.tsx",
      },
      {
        requirementId: "1.1",
        testCases: ["tab-layout context preserve"],
        testSuite: "src/tests/navigation/tab-layout.test.tsx",
      },
    ]);

    expect(errors).toEqual([
      "Requirement ID `1.1` is duplicated in mapping entries.",
    ]);
  });

  test("detects invalid requirement ID format", () => {
    const errors = validateRequirementTestMapping([
      {
        requirementId: "A-1",
        testCases: ["invalid format sample"],
        testSuite: "src/tests/navigation/tab-layout.test.tsx",
      },
    ]);

    expect(errors).toEqual([
      "Requirement ID `A-1` must match `major.minor` format.",
    ]);
  });
});
