# Graph詳細（Month/Year）実装とHome導線統合

このExecPlanは living document です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を実装中に更新し続けます。

このドキュメントは `/Users/ryosuke/dev/ExpoProjects/pixel-habit/docs/PLANS.md` に準拠して維持します。

## Purpose / Big Picture

この変更後、ユーザーはHomeのグラフカードから詳細画面へ移動し、`Month`（暦月）と`Year`（暦年）の単位で記録を確認できます。Homeの14週固定表示とDetailの期間を明確に分離し、記録の見通しを改善します。動作確認は、Homeから詳細遷移し、表示モードを切り替えて範囲ラベルと記録一覧が変わることを目視できる状態を成功とします。

## Progress

- [x] (2026-02-14 12:57Z) 現状確認完了（Home 14週固定、Today上位1件、Graph詳細ルート未実装）。
- [x] (2026-02-14 12:57Z) 実装対象と受け入れ条件を確定（Month=暦月、Year=暦年、Home導線追加）。
- [x] (2026-02-14 13:03Z) Graph詳細画面とルート実装。
- [x] (2026-02-14 13:03Z) HomeカードからGraph詳細遷移を実装。
- [x] (2026-02-14 13:03Z) カレンダー範囲の共通lib追加と単体テスト追加。
- [x] (2026-02-14 13:03Z) Graph詳細のIntegrationテスト追加。
- [x] (2026-02-14 13:03Z) 既存テスト回帰確認と `test/check/tsc` 実行。
- [x] (2026-02-14 13:03Z) docs（screen-flow / api-usecases / product-spec / architecture）同期。

## Surprises & Discoveries

- Observation: `GraphCard` は現在「記録する」「記録一覧」の操作のみで、詳細遷移導線がない。
  Evidence: `src/features/graphs/components/graph-card.tsx` の `GraphCardProps` に詳細遷移ハンドラが存在しない。

- Observation: `CompactHeatmap` は「週数指定 + 今日基準の逆算」方式で、任意の暦月/暦年範囲を直接描画できない。
  Evidence: `src/features/graphs/components/compact-heatmap.tsx` の `getCompactHeatmapDateRange` / `resolveStartDate` 実装。

- Observation: `GraphListScreen` のテストで `VirtualizedList` のact警告が継続的に出る。
  Evidence: `npm run test -- --runInBand` 実行時に `inside a test was not wrapped in act` が出力されたため、既存のwarningフィルタ条件を汎化して抑制。

## Decision Log

- Decision: Phase1のGraph詳細は「範囲別の記録一覧 + Light統計」を主機能とし、Detail専用の新規ヒートマップ実装は行わない。
  Rationale: 先にユーザー価値（期間別確認）を早く提供し、Home 14週の既存UIを壊さず回帰リスクを抑えるため。
  Date/Author: 2026-02-14 / Codex

- Decision: 月/年の期間計算は `src/shared/lib/calendar-range.ts` に集約する。
  Rationale: 期間ロジックの重複防止とテスト可能性の向上。
  Date/Author: 2026-02-14 / Codex

- Decision: Graph詳細の初期段階は「一覧 + Light統計」に限定し、Detail専用ヒートマップは次フェーズへ送る。
  Rationale: Homeの既存ヒートマップ実装へ影響を出さず、先に期間確認の価値を提供するため。
  Date/Author: 2026-02-14 / Codex

## Outcomes & Retrospective

Graph詳細（Month/Year）の主要価値は達成できた。Homeカードから詳細に遷移し、暦月・暦年の切替で記録範囲を確認できる。`calendar-range` を共通化したことで、今後の期間ロジック追加時の重複も抑えられる。

残課題は「Detail専用の視覚表現（ヒートマップ/チャート）」であり、これは機能回帰リスクを避けるため次フェーズに分離した。今回の成果は、21 suites / 92 testsの全通過で検証済み。

## Context and Orientation

このリポジトリは Expo Router を採用しています。Homeは `src/app/(tabs)/home.tsx` から `src/features/graphs/graph-list-screen.tsx` を表示しています。グラフカードは `src/features/graphs/components/graph-card.tsx` で描画され、記録一覧は `src/app/graphs/[graphId]/pixels.tsx` へ遷移します。

APIアクセスは `src/shared/api/authed-pixela-api.ts` 経由で行い、実体の呼び出しは `src/shared/api/graph.ts` / `src/shared/api/pixel.ts` にあります。認証は `AuthSessionProvider` で管理されています。

今回追加するGraph詳細の目的は「期間別に記録確認できること」です。期間は仕様固定で、`Month` は暦月（1日から末日）、`Year` は暦年（1月1日から12月31日）です。

## Plan of Work

まず `src/shared/lib/calendar-range.ts` に暦月・暦年のfrom/toを返す関数を追加し、`*.test.ts` で固定時刻ベースに検証します。次に `src/features/graphs/graph-detail-screen.tsx` を新規作成し、route paramsから `graphId` と `graphName` を受け取り、表示モード（Month/Year）に応じて `api.getPixels({ graphId, from, to })` を呼びます。

Graph詳細は、ヘッダー、期間切替、範囲ラベル、Light統計（合計・記録日数・最大値）、記録一覧、ローディング、エラー再試行を持たせます。UIは `heroui-native` のButton/Cardトーンを優先し、Uniwindで余白階層を統一します。

次に `src/app/graphs/[graphId]/index.tsx` を追加し、Homeカードから `pathname: "/graphs/[graphId]"` へ遷移できるよう `graph-list-screen.tsx` と `graph-card.tsx` を更新します。最後にIntegrationテストとドキュメントを同期します。

## Concrete Steps

作業ディレクトリは `/Users/ryosuke/dev/ExpoProjects/pixel-habit`。

1. `src/shared/lib/calendar-range.ts` と `src/shared/lib/calendar-range.test.ts` を追加。
2. `src/features/graphs/graph-detail-screen.tsx` と `src/features/graphs/graph-detail-screen.test.tsx` を追加。
3. `src/app/graphs/[graphId]/index.tsx` を追加。
4. `src/features/graphs/components/graph-card.tsx` と `src/features/graphs/graph-list-screen.tsx` を更新。
5. `src/features/graphs/components/graph-card.test.tsx` と `src/features/graphs/graph-list-screen.test.tsx` を更新。
6. `docs/screen-flow.md`、`docs/api-usecases.md`、`docs/product-spec.md`、`docs/architecture.md` を実装内容に合わせて更新。
7. 検証を実行。

期待する検証コマンド:

    npm run test -- --runInBand
    npm exec -- ultracite check src docs app.json
    npx tsc --noEmit

## Validation and Acceptance

- Homeで任意のグラフカードから詳細へ遷移できる。
- 詳細画面で `Month` / `Year` を切り替えると、期間ラベルと記録一覧が対応する暦期間へ変わる。
- 詳細画面でAPI失敗時にエラー表示と再試行が機能する。
- 既存のHome/Settings/Auth/Pixel CRUDに回帰がない。
- テスト、lint、型検査がすべて通る。

## Idempotence and Recovery

この作業は同じ手順で再実行しても安全です。途中失敗時は、失敗したステップから再開します。API・DBマイグレーションのような破壊的操作は含みません。

## Artifacts and Notes

実装後に、主要テスト結果と重要差分を追記する。

## Interfaces and Dependencies

追加する関数（`src/shared/lib/calendar-range.ts`）:

    export interface CalendarRange {
      from: string;
      to: string;
    }

    export const getCalendarMonthRange: (baseDate?: Date) => CalendarRange;
    export const getCalendarYearRange: (baseDate?: Date) => CalendarRange;
    export const formatCalendarModeLabel: (mode: "month" | "year", baseDate?: Date) => string;

追加する画面（`src/features/graphs/graph-detail-screen.tsx`）:

    export const GraphDetailScreen = () => JSX.Element;

更新するカードprops（`src/features/graphs/components/graph-card.tsx`）:

    onPressOpenDetail: (graph: GraphDefinition) => void

---

Revision Note (2026-02-14 12:57Z): 初版作成。現状分析結果とPhase1の実装範囲・受け入れ条件を反映。
Revision Note (2026-02-14 13:03Z): 実装完了に合わせてProgress、Decision Log、Surprises、Outcomesを更新。
