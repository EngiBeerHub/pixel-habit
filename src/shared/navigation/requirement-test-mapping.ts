export interface RequirementTestMappingEntry {
  requirementId: string;
  testSuite: string;
  testCases: string[];
}

const REQUIREMENT_ID_FORMAT = /^\d+\.\d+$/;

/**
 * Native tab navigation 仕様に対する要件IDとテスト責務の対応表。
 */
export const nativeTabRequirementTestMapping: RequirementTestMappingEntry[] = [
  {
    requirementId: "1.1",
    testCases: ["uses Native Tabs with Habits/Settings trigger labels"],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "1.2",
    testCases: ["keeps tab navigation context with history back behavior"],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "1.3",
    testCases: ["defines selected/unselected icon states for both tabs"],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "1.4",
    testCases: [
      "stays on current screen and shows retry dialog when replace throws",
    ],
    testSuite: "src/shared/navigation/tab-navigation-fallback.test.ts",
  },
  {
    requirementId: "1.5",
    testCases: ["uses Native Tabs with Habits/Settings trigger labels"],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "2.1",
    testCases: [
      "applies large title at screen level instead of global stack default",
    ],
    testSuite: "src/tests/navigation/home-stack-layout.test.tsx",
  },
  {
    requirementId: "2.2",
    testCases: ["applies large title policy per screen"],
    testSuite: "src/tests/navigation/settings-stack-layout.test.tsx",
  },
  {
    requirementId: "2.3",
    testCases: ["loads month range by default"],
    testSuite: "src/features/graphs/graph-detail-screen.test.tsx",
  },
  {
    requirementId: "2.4",
    testCases: ["does not show period label text under header"],
    testSuite: "src/features/graphs/graph-list-screen.test.tsx",
  },
  {
    requirementId: "3.1",
    testCases: ["returns iOS root options without synthetic back control"],
    testSuite: "src/shared/navigation/stack-back-policy.test.ts",
  },
  {
    requirementId: "3.2",
    testCases: ["returns iOS child options with standard back visible"],
    testSuite: "src/shared/navigation/stack-back-policy.test.ts",
  },
  {
    requirementId: "3.3",
    testCases: [
      "opens graph management menu from ellipsis button",
      "opens fallback dialog menu when native menu is unavailable",
    ],
    testSuite: "src/features/graphs/graph-detail-screen.test.tsx",
  },
  {
    requirementId: "3.4",
    testCases: ["opens graph management menu from ellipsis button"],
    testSuite: "src/features/graphs/graph-detail-screen.test.tsx",
  },
  {
    requirementId: "4.1",
    testCases: ["keeps single header add action routing to create screen"],
    testSuite: "src/tests/navigation/home-stack-layout.test.tsx",
  },
  {
    requirementId: "4.2",
    testCases: [
      "navigates to graph detail from card",
      "prevents duplicate detail navigation on rapid repeated card taps",
    ],
    testSuite: "src/features/graphs/graph-list-screen.test.tsx",
  },
  {
    requirementId: "4.3",
    testCases: ["does not call onPressCell when future date cell is tapped"],
    testSuite: "src/features/graphs/components/compact-heatmap.test.tsx",
  },
  {
    requirementId: "4.4",
    testCases: [
      "keeps graph list visible when cached data exists during loading",
    ],
    testSuite: "src/features/graphs/graph-list-screen.loading-state.test.tsx",
  },
  {
    requirementId: "5.1",
    testCases: ["defines Android icon states for both tabs"],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "5.2",
    testCases: ["opens fallback dialog menu when native menu is unavailable"],
    testSuite: "src/features/graphs/graph-detail-screen.test.tsx",
  },
  {
    requirementId: "5.3",
    testCases: ["returns false on Expo Go runtime"],
    testSuite: "src/shared/navigation/native-menu-capability.test.ts",
  },
  {
    requirementId: "6.1",
    testCases: [
      "uses Native Tabs with Habits/Settings trigger labels",
      "keeps tab navigation context with history back behavior",
    ],
    testSuite: "src/tests/navigation/tab-layout.test.tsx",
  },
  {
    requirementId: "6.2",
    testCases: [
      "opens graph management menu from ellipsis button",
      "navigates to edit screen from graph management menu",
    ],
    testSuite: "src/features/graphs/graph-detail-screen.test.tsx",
  },
  {
    requirementId: "6.3",
    testCases: ["returns no errors for native tab requirement mapping"],
    testSuite: "src/shared/navigation/requirement-test-mapping.test.ts",
  },
];

/**
 * 対応表の基本妥当性（ID形式・重複・必須要素）を検証する。
 */
export const validateRequirementTestMapping = (
  mapping: RequirementTestMappingEntry[]
): string[] => {
  const errors: string[] = [];
  const seenRequirementIds = new Set<string>();

  for (const entry of mapping) {
    if (!REQUIREMENT_ID_FORMAT.test(entry.requirementId)) {
      errors.push(
        `Requirement ID \`${entry.requirementId}\` must match \`major.minor\` format.`
      );
    }

    if (seenRequirementIds.has(entry.requirementId)) {
      errors.push(
        `Requirement ID \`${entry.requirementId}\` is duplicated in mapping entries.`
      );
    } else {
      seenRequirementIds.add(entry.requirementId);
    }

    if (!entry.testSuite.trim()) {
      errors.push(
        `Requirement ID \`${entry.requirementId}\` must include a non-empty test suite path.`
      );
    }

    if (entry.testCases.length === 0) {
      errors.push(
        `Requirement ID \`${entry.requirementId}\` must include at least one test case title.`
      );
    }
  }

  return errors;
};
