# Requirement-Test Traceability

`native-tab-navigation` の要件IDと自動テスト責務の対応表。
要件変更時は本表と `src/shared/navigation/requirement-test-mapping.ts` を同時更新する。

| Requirement ID | Test Suite | Test Cases |
|---|---|---|
| 1.1 | `src/tests/navigation/tab-layout.test.tsx` | uses Native Tabs with Habits/Settings trigger labels |
| 1.2 | `src/tests/navigation/tab-layout.test.tsx` | keeps tab navigation context with history back behavior |
| 1.3 | `src/tests/navigation/tab-layout.test.tsx` | defines selected/unselected icon states for both tabs |
| 1.4 | `src/shared/navigation/tab-navigation-fallback.test.ts` | stays on current screen and shows retry dialog when replace throws |
| 1.5 | `src/tests/navigation/tab-layout.test.tsx` | uses Native Tabs with Habits/Settings trigger labels |
| 2.1 | `src/tests/navigation/home-stack-layout.test.tsx` | applies large title at screen level instead of global stack default |
| 2.2 | `src/tests/navigation/settings-stack-layout.test.tsx` | applies large title policy per screen |
| 2.3 | `src/features/graphs/graph-detail-screen.test.tsx` | loads month range by default |
| 2.4 | `src/features/graphs/graph-list-screen.test.tsx` | does not show period label text under header |
| 3.1 | `src/shared/navigation/stack-back-policy.test.ts` | returns iOS root options without synthetic back control |
| 3.2 | `src/shared/navigation/stack-back-policy.test.ts` | returns iOS child options with standard back visible |
| 3.3 | `src/features/graphs/graph-detail-screen.test.tsx` | opens graph management menu from ellipsis button; opens fallback dialog menu when native menu is unavailable |
| 3.4 | `src/features/graphs/graph-detail-screen.test.tsx` | opens graph management menu from ellipsis button |
| 4.1 | `src/tests/navigation/home-stack-layout.test.tsx` | keeps single header add action routing to create screen |
| 4.2 | `src/features/graphs/graph-list-screen.test.tsx` | navigates to graph detail from card; prevents duplicate detail navigation on rapid repeated card taps |
| 4.3 | `src/features/graphs/components/compact-heatmap.test.tsx` | does not call onPressCell when future date cell is tapped |
| 4.4 | `src/features/graphs/graph-list-screen.loading-state.test.tsx` | keeps graph list visible when cached data exists during loading |
| 5.1 | `src/tests/navigation/tab-layout.test.tsx` | defines Android icon states for both tabs |
| 5.2 | `src/features/graphs/graph-detail-screen.test.tsx` | opens fallback dialog menu when native menu is unavailable |
| 5.3 | `src/shared/navigation/native-menu-capability.test.ts` | returns false on Expo Go runtime |
| 6.1 | `src/tests/navigation/tab-layout.test.tsx` | uses Native Tabs with Habits/Settings trigger labels; keeps tab navigation context with history back behavior |
| 6.2 | `src/features/graphs/graph-detail-screen.test.tsx` | opens graph management menu from ellipsis button; navigates to edit screen from graph management menu |
| 6.3 | `src/shared/navigation/requirement-test-mapping.test.ts` | covers all requirement IDs from 1.1 to 6.3; returns no errors for native tab requirement mapping |
