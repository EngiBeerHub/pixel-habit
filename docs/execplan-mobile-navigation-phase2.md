# モバイルナビゲーション統一（Phase 2）

このExecPlanは living document です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を実装中に更新し続けます。

このドキュメントは `/Users/ryosuke/dev/ExpoProjects/pixel-habit/docs/PLANS.md` に準拠して維持します。

## Purpose / Big Picture

この変更後、Graph/Pixel関連画面はモバイル標準のStackヘッダーで遷移し、画面内の戻るボタンに依存しない自然な操作になります。これにより、画面ごとの独自ヘッダー実装が減り、今後のUI改善で一貫性を維持しやすくなります。

## Progress

- [x] (2026-02-14 13:19Z) 現状調査完了（Graph/Pixel系画面が独自ヘッダー + `pt-16` + 画面内戻るボタン依存）。
- [x] (2026-02-14 13:19Z) Graph配下に `src/app/graphs/_layout.tsx` を追加し、Stackヘッダーを導入。
- [x] (2026-02-14 13:19Z) Graph/Pixel詳細系画面の上余白をStackヘッダー前提へ調整。
- [x] (2026-02-14 13:20Z) 画面内戻るボタン削減後の導線テストを回帰確認（既存Integration通過）。
- [ ] Tabs配下（Home/Settings）のヘッダー戦略を共通化（次マイルストーン）。
- [x] (2026-02-14 13:20Z) docs（screen-flow / architecture）にナビ方針を反映。

## Surprises & Discoveries

- Observation: Graph/Pixel画面はすでに複数の「戻る」UI（headerなし + 画面ボタン）を混在させていた。
  Evidence: `src/features/graphs/graph-detail-screen.tsx`, `src/features/pixels/pixel-list-screen.tsx`, `src/features/pixels/pixel-add-screen.tsx` の戻るボタン実装。

- Observation: Expo RouterのStackオプションで `headerBackTitleVisible` は型定義に存在しない。
  Evidence: `npx tsc --noEmit` で `TS2353` が発生し、`src/app/graphs/_layout.tsx` から当該プロパティを削除して解消。

## Decision Log

- Decision: Phase 2の最初はGraph配下だけ先にStack化する。
  Rationale: 影響範囲を限定し、既存のTabs導線を壊さず段階移行するため。
  Date/Author: 2026-02-14 / Codex

- Decision: `ScreenContainer` に `withTopInset` を追加し、Stackヘッダー有無で上余白を切り替える。
  Rationale: 既存画面の大規模改修を避けつつ、ヘッダー重複余白を解消するため。
  Date/Author: 2026-02-14 / Codex

## Outcomes & Retrospective

Phase 2の初期目標（Graph配下のStack化と上余白調整）は完了した。画面内戻るボタンを削減しても、全Integrationを含む 21 suites / 92 tests が通過している。残る作業は Tabs配下（Home/Settings）のヘッダー統一であり、次マイルストーンで共通ヘッダー戦略を実装する。

## Context and Orientation

現状のルーティングは Expo Router 構成で、`src/app/(tabs)` が主要タブ、`src/app/graphs/*` が詳細導線です。これまでは `src/app/(tabs)/_layout.tsx` で `headerShown: false` とし、各画面で独自ヘッダーを描画していました。

このフェーズでは Graph配下のみ `src/app/graphs/_layout.tsx` を追加し、`Stack` の標準ヘッダーを適用します。Graph/Pixel詳細画面は `pt-16` を `pt-6` 相当へ移して、ヘッダー二重化を防ぎます。

## Plan of Work

まず `src/app/graphs/_layout.tsx` を追加し、Graph/Pixel関係の子ルートにタイトルを割り当てます。次に `src/features/graphs/graph-detail-screen.tsx`、`src/features/pixels/pixel-list-screen.tsx`、`src/features/pixels/pixel-add-screen.tsx`、`src/features/pixels/pixel-detail-screen.tsx` の戻るボタンと余白を整理します。`ScreenContainer` を使う画面は `withTopInset={false}` で上余白を調整します。

その後、テストを更新し、遷移がStackヘッダー前提でも破綻しないことを確認します。最後に docs へナビ方針を反映し、次段階（Tabs側の共通ヘッダー）に進みます。

## Concrete Steps

作業ディレクトリは `/Users/ryosuke/dev/ExpoProjects/pixel-habit`。

1. `src/app/graphs/_layout.tsx` を追加。
2. `src/shared/ui/screen-container.tsx` に `withTopInset` を追加。
3. Graph/Pixel詳細系画面の `pt` と戻るUIを調整。
4. 関連テストを更新。
5. `npm run test -- --runInBand`、`npm exec -- ultracite check src docs app.json`、`npx tsc --noEmit` を実行。

## Validation and Acceptance

- Graph配下の画面でStackヘッダーが表示される。
- 各画面の上余白が過剰にならない。
- 画面内の戻るボタンを減らしても遷移が成立する。
- テスト、lint、型検査が通る。

## Idempotence and Recovery

この作業は再実行可能です。ルーティング追加とUI調整のみで、破壊的変更は含みません。問題が出た場合は `src/app/graphs/_layout.tsx` と各画面の戻るUI差分を個別に巻き戻して検証できます。

## Artifacts and Notes

実装後に主要テスト結果を追記する。

## Interfaces and Dependencies

新規レイアウト:

    src/app/graphs/_layout.tsx
    export default function GraphStackLayout(): JSX.Element

共通UI拡張:

    src/shared/ui/screen-container.tsx
    interface ScreenContainerProps {
      withTopInset?: boolean;
    }

---

Revision Note (2026-02-14 13:19Z): 初版作成。Graph配下Stack化と余白調整の進捗を反映。
Revision Note (2026-02-14 13:20Z): Graph/PixelのStack移行実装後、Progress/Discoveries/Outcomesを更新。
