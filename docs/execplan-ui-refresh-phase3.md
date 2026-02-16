# UI刷新と導線統一（Phase 3 以降）

このExecPlanは living document です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を実装中に更新し続けます。

このドキュメントは `/Users/ryosuke/dev/ExpoProjects/pixel-habit/docs/PLANS.md` に準拠して維持します。

## Purpose / Big Picture

この変更後、Home/Detail/Settings の体験は「入力導線が明確で、視覚ノイズが少なく、モバイル標準の操作で迷わない」状態になります。具体的には、Home は `セル/+/カード` に集中し、Graph 詳細は統計+記録一覧で参照と管理を完結し、Settings は運用導線（トークン変更など）が別画面で安全に扱えるようになります。

## Progress

- [x] (2026-02-16 00:00Z) Phase 0: ドキュメント方針更新（Today廃止、Home期間表示廃止、Navigation標準化、Haptics方針追記）。
- [x] (2026-02-16 00:00Z) Phase 1: Home + Navigation の実装着手（タブアイコン、ヘッダー右上アイコン化、Homeスケルトン化、未来日セル押下伝播対策）。
- [ ] Phase 1: テスト/品質ゲート最終確認。
- [ ] Phase 1.5: スクロールバー表示ポリシー統一（通常画面は非表示、例外のみ許可）。
- [ ] Phase 2: Quick Add UX最適化（1stビュー保存可視、必須表示、単位表示、説明文削除、保存成功haptics）。
- [ ] Phase 3: Graph Detail 情報設計完成（Tabs切替、統計拡張、日付整形、記録行再構成、管理操作再設計）。
- [ ] Phase 4: PixelDetail削除トーン統一 + Settings再設計（トークン変更別画面化）。
- [ ] Phase 5: Dialog統一 + Dark mode + Haptics拡張 + 技術品質改善。

## Surprises & Discoveries

- Observation: HomeのTodayエリアはデータ整合を維持するために追加queryが必要で、UI密度の高さと実装複雑性の両方を増やしていた。
  Evidence: `src/features/graphs/graph-list-screen.tsx` の `useQueries` + missing判定ロジック。

- Observation: 未来日セルの `disabled` だけでは親カード `Pressable` 側にタップ意図が流れる可能性がある。
  Evidence: CompactHeatmapが親カード内にネストされ、カード全体が `Pressable` である構造。

## Decision Log

- Decision: Phase 1ではHomeのTodayエリアと期間ラベルを削除し、導線を `セル/+/カード` に固定する。
  Rationale: 入力導線が重複しているほど認知負荷と表示不整合が増えるため。
  Date/Author: 2026-02-16 / Codex

- Decision: Graph/Pixel Stack の戻るはOS標準バック表示に戻し、独自「戻る」ラベルを廃止する。
  Rationale: 見た目の一貫性とプラットフォーム期待値を優先するため。
  Date/Author: 2026-02-16 / Codex

- Decision: Home/GraphCard の初期ロードはスケルトン優先に変更する。
  Rationale: リスト構造を先に見せるほうが体感速度と文脈維持に有利なため。
  Date/Author: 2026-02-16 / Codex

## Outcomes & Retrospective

Phase 1完了時点で更新する。評価軸は「不要導線の削減」「誤タップ導線の除去」「初期表示の体感改善」「回帰テスト通過」。

## Context and Orientation

このリポジトリの主要導線は `src/app/(tabs)` と `src/app/graphs` に分かれています。Home本体は `src/features/graphs/graph-list-screen.tsx`、カード描画は `src/features/graphs/components/graph-card.tsx`、セル描画は `src/features/graphs/components/compact-heatmap.tsx` です。

Settingsは現在 `src/features/settings/settings-screen.tsx` に集約されています。Dialogは `src/shared/platform/app-alert.ts` で `Alert.alert` ラップ実装を使っています。

## Plan of Work

最初にドキュメント（product-spec, screen-flow, architecture, api-usecases）を新方針へ同期し、実装より先に仕様を固定します。次に、Home/Navigationの変更を先行して適用します。ここではタブアイコン、ヘッダーアクションのアイコン化、Today/期間ラベル撤去、スケルトン導入、未来日セルの誤遷移防止を一括で行います。

その後、Quick AddとGraph Detailを段階的に再設計し、最後にSettings分割とDialog/Haptics/Dark modeへ進みます。各フェーズで `test/check/tsc` を通し、毎回ドキュメントと実装差分を同コミットで更新します。

## Concrete Steps

作業ディレクトリは `/Users/ryosuke/dev/ExpoProjects/pixel-habit`。

1. Phase 0: docs更新
   - `docs/product-spec.md`
   - `docs/screen-flow.md`
   - `docs/architecture.md`
   - `docs/api-usecases.md`
2. Phase 1: Home + Navigation 実装
   - `src/app/(tabs)/_layout.tsx`
   - `src/app/graphs/_layout.tsx`
   - `src/features/graphs/graph-list-screen.tsx`
   - `src/features/graphs/components/graph-card.tsx`
   - `src/features/graphs/components/compact-heatmap.tsx`
3. Phase 1.5: スクロールインジケータ統一
   - `ScrollView` / `FlatList` / `SectionList` / Bottom Sheet内スクロールで
     `showsVerticalScrollIndicator={false}` と `showsHorizontalScrollIndicator={false}` を標準化
   - 例外画面は理由をコメントで明記し、レビューで明示許可
4. テスト更新
   - `src/features/graphs/graph-list-screen.test.tsx`
   - `src/features/graphs/components/graph-card.test.tsx`
   - `src/features/graphs/components/compact-heatmap.test.tsx`
5. 品質ゲート
   - `npm run test -- --runInBand`
   - `npm exec -- ultracite check src docs app.json`
   - `npx tsc --noEmit`

## Validation and Acceptance

- HomeにTodayエリアと期間ラベルが表示されない。
- Homeヘッダー右上はアイコンボタンでグラフ作成へ遷移する。
- タブにアイコンが表示される。
- Graph/Pixel配下の戻る導線がOS標準バック表示になる。
- HomeとGraphCardのロードがスケルトン表示になる。
- 未来日セルをタップしてもGraph詳細へ遷移しない。
- 通常画面でスクロールバーが常時表示されない。
- `test/check/tsc` が通る。

## Idempotence and Recovery

この計画は段階適用を前提とし、各フェーズを独立して再実行可能です。Phase 1の変更は導線と表示に限定され、APIシグネチャ変更を含みません。問題が出た場合は、`Home/Navigation` 差分のみを局所的に戻しても機能全体は維持できます。

## Artifacts and Notes

実装後にテスト結果サマリと主要差分をここへ追記する。

## Interfaces and Dependencies

- Home/Navigationは `expo-router` + `heroui-native` の標準コンポーネントを優先する。
- セル押下フィードバックは `heroui-native` の `PressableFeedback` を利用する。
- 削除確認などのDialog統一は次フェーズで `useAppDialog` インターフェースへ移行する。
- Hapticsは `expo-haptics` を導入し、主要操作限定で使用する。

---

Revision Note (2026-02-16 00:00Z): 初版作成。UI刷新の全体方針、フェーズ構成、Phase 0/1の受け入れ条件を明文化。
