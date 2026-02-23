# Repo-wide Refactor Program（保守性・一貫性・性能の底上げ）

このExecPlanは living document です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を実装中に更新し続けます。

このドキュメントは `/Users/ryosuke/dev/ExpoProjects/pixel-habit/docs/PLANS.md` に準拠して維持します。

## Purpose / Big Picture

このリファクタリング後、ユーザーが触れる挙動は維持したまま、実装は「変更しやすく壊れにくい」状態になります。  
具体的には、巨大化した画面実装を責務ごとに分割し、共通ロジックを `src/shared` に集約し、UI実装を HeroUI Native 前提で統一します。  
成功条件は、主要導線の回帰なしで `test/check/tsc` が通り、主要 screen / test ファイル行数が基準値以下に近づくことです。

## Progress

- [x] (2026-02-22 22:43Z) Program計画を作成し、実行順（A→E）と完了基準を固定。
- [x] (2026-02-22 23:10Z) Milestone A: Shared基盤抽出（query keys / invalidation / optionalData / summary/date）を完了。
- [x] (2026-02-22 23:12Z) Milestone B: Graph Listの分割（hook + quick add + list states）を完了。
- [x] (2026-02-22 23:14Z) Milestone C: Graph Detailの分割（hook + section components）を完了。
- [x] (2026-02-22 23:20Z) Milestone D: Form実装統一（Graph Create/Edit, Pixel Detail, Token）を完了。
- [x] (2026-02-22 23:34Z) Milestone Eの一部として、`render-with-providers` を導入しGraph/Pixel主要テストのProvider重複を削減。
- [ ] Milestone E: テスト基盤整理 + 最終監査（描画/スクロール/再描画）+ docs同期を完了。

## Surprises & Discoveries

- Observation: `graph-list-screen.tsx` と `graph-detail-screen.tsx` に UI/状態/副作用/ユーティリティが同居し、変更時の影響範囲が大きい。
  Evidence: `/Users/ryosuke/dev/ExpoProjects/pixel-habit/src/features/graphs/graph-list-screen.tsx`（499行）、`/Users/ryosuke/dev/ExpoProjects/pixel-habit/src/features/graphs/graph-detail-screen.tsx`（725行）。

- Observation: Query key と invalidate が文字列リテラルで分散しており、保守時に漏れが起こりやすい。
  Evidence: `rg "queryKey: \\[|invalidateQueries\\(|refetchQueries\\(" src/features src/shared` の結果。

## Decision Log

- Decision: 先に Shared 抽出を行い、画面分割はその後に実施する。
  Rationale: 画面分割より先に依存先を安定化した方が差分衝突と回帰リスクが低い。
  Date/Author: 2026-02-22 / Codex

- Decision: 外部API契約（Pixela呼び出しインターフェース）は変更しない。
  Rationale: リファクタ段階で機能変更を混ぜないため。
  Date/Author: 2026-02-22 / Codex

## Outcomes & Retrospective

最終完了時に更新する。評価軸は以下の3点。  
1) 回帰なし（受け入れ導線維持）  
2) 主要画面の責務分離完了  
3) docs と実装の整合維持

## Context and Orientation

主要対象は `src/features/graphs/*`, `src/features/pixels/*`, `src/features/settings/*`, `src/shared/*`。  
特に Graph系2画面は巨大化しており、ロジックが画面内に閉じている。  
`docs/product-spec.md` → `docs/screen-flow.md` → `docs/architecture.md` の順で仕様優先し、挙動を変えず実装構造を改善する。

## Plan of Work

最初に Shared を抽出する。対象は query key、invalidate、optionalData 変換、Graph Detailの統計算出と日付整形。  
次に Graph List と Graph Detail を hook + section components へ分離し、screen本体をオーケストレーション専用にする。  
その後、フォーム画面を HeroUI Native + shared UI コンポーネントへ統一し、最後にテスト基盤と描画品質を整える。  
各マイルストーン終端で品質ゲートを必ず通す。

## Concrete Steps

作業ディレクトリ: `/Users/ryosuke/dev/ExpoProjects/pixel-habit`

1. Shared抽出
   - 追加: `src/shared/api/query-keys.ts`, `src/shared/api/invalidation.ts`
   - 追加: `src/shared/lib/optional-data.ts`, `src/shared/lib/graph-detail-summary.ts`, `src/shared/lib/pixela-date.ts`
   - 更新: `src/shared/api/pixel.ts`, `src/features/graphs/graph-list-screen.tsx`, `src/features/pixels/pixel-detail-screen.tsx`, `src/features/graphs/graph-detail-screen.tsx`
2. Graph List分割
   - 追加: `src/features/graphs/hooks/use-graph-list-screen.ts`
   - 追加: `src/features/graphs/components/quick-add-sheet.tsx`
   - 追加: `src/features/graphs/components/graph-list-states.tsx`
   - 更新: `src/features/graphs/graph-list-screen.tsx`
3. Graph Detail分割
   - 追加: `src/features/graphs/hooks/use-graph-detail-screen.ts`
   - 追加: section components
   - 更新: `src/features/graphs/graph-detail-screen.tsx`
4. Form統一
   - 更新: `graph-create-screen.tsx`, `graph-edit-screen.tsx`, `pixel-detail-screen.tsx`, `token-update-screen.tsx`
5. テスト/最終監査/docs
   - 更新: 影響テスト群、`docs/architecture.md` 等

## Validation and Acceptance

各マイルストーン終端で以下を実行する:

    npm run test -- --runInBand
    npm exec -- ultracite check src docs app.json
    npx tsc --noEmit

受け入れ条件:

- Home導線 `セル/+/カード` が維持される
- Graph Detail の Month/Year・記録遷移・メニュー操作が維持される
- optionalData（JSON/非JSON/空白/改行）の互換が壊れない
- Settings のトークン変更/危険操作導線が維持される

## Idempotence and Recovery

この作業は段階的に適用し、各マイルストーン単位で巻き戻し可能にする。  
1コミット1目的を維持し、問題発生時は該当マイルストーンのみ差し戻す。

## Artifacts and Notes

ベースライン（2026-02-22時点）:

- 主要screen行数: `graph-detail-screen.tsx` 725行、`graph-list-screen.tsx` 499行
- 主要test行数: `graph-list-screen.test.tsx` 570行、`graph-detail-screen.test.tsx` 433行
- 品質ゲート: pass（21 suites, 104 tests）

進捗更新（2026-02-22 23:34Z）:

- 主要screen行数: `graph-detail-screen.tsx` 116行、`graph-list-screen.tsx` 99行
- 関連フォーム画面: `pixel-detail-screen.tsx` 221行、`token-update-screen.tsx` 105行
- 共有基盤追加: `query-keys.ts` / `invalidation.ts` / `optional-data.ts` / `graph-detail-summary.ts` / `pixela-date.ts`
- テスト基盤追加: `src/test-utils/render-with-providers.tsx`

## Interfaces and Dependencies

追加する内部インターフェース:

- query key factory（`src/shared/api/query-keys.ts`）
- invalidate helper（`src/shared/api/invalidation.ts`）
- optionalData変換（`src/shared/lib/optional-data.ts`）
- Graph Detail summary/date utilities（`src/shared/lib/graph-detail-summary.ts`, `src/shared/lib/pixela-date.ts`）

外部契約:

- Pixela APIシグネチャは変更しない
- Expo Router 公開ルートは維持する

---

Revision Note (2026-02-22 22:43Z): 初版作成。Program全体の実行順と完了基準、ベースラインを追加。  
Revision Note (2026-02-22 23:34Z): Milestone A-D完了を反映。行数・共有基盤・テスト基盤の進捗を追記。
