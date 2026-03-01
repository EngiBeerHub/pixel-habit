# Research & Design Decisions

## Summary
- **Feature**: `graph-detail`
- **Discovery Scope**: Extension
- **Key Findings**:
  - 既存 Graph Detail は `month/year` モードで `from/to` を切り替えて `api.getPixels` を呼ぶ構造で、拡張は mode と期間計算の差し替え中心で成立する。
  - Home の `CompactHeatmap` は既定 14 週を持ち、週数パラメータを受け取れるため、Graph Detail の Short/Full 表示にも再利用可能。
  - Pixela API の `GET /v1/users/<username>/graphs/<graphID>/pixels` は `from/to` 指定が可能で、53 週表示も既存 API 契約の範囲内で実現できる。

## Research Log

### Graph Detail 既存拡張ポイント
- **Context**: 既存機能に対する拡張か新規作成かを判定するため。
- **Sources Consulted**:
  - `src/features/graphs/hooks/use-graph-detail-screen.tsx`
  - `src/features/graphs/components/graph-detail-range-section.tsx`
  - `src/features/graphs/graph-detail-screen.tsx`
  - `src/shared/api/query-keys.ts`
- **Findings**:
  - 既存 mode は `month | year` の union type。
  - query key は `graphDetailPixels(username, graphId, mode)` で mode 依存キャッシュを分離済み。
  - 画面は読み込み・エラー・再試行状態を既に実装済み。
- **Implications**:
  - 影響範囲は `CalendarMode` と range 計算、切替 UI、関連テストが中心。
  - 既存のエラーハンドリング/再試行パターンは設計変更不要。

### Heatmap 再利用性とセル操作制約
- **Context**: Short=14週 / Full=53週 と「セルタップ追加なし」を満たす UI 構成を確認するため。
- **Sources Consulted**:
  - `src/features/graphs/components/compact-heatmap.tsx`
  - `src/features/graphs/graph-list-screen.tsx`
- **Findings**:
  - `CompactHeatmap` は `weeks` 指定に対応し、既定値は 14 週。
  - `onPressCell` は optional であり、未指定ならセルタップによる追加導線を無効化できる。
- **Implications**:
  - Graph Detail 用に新規ヒートマップコンポーネントを作らず、既存 `CompactHeatmap` を read-only で利用する方針が妥当。

### ワイヤーフレーム整合性（GraphDetail）
- **Context**: 統計 UI の粒度が要件で不足していないかを検証するため。
- **Sources Consulted**:
  - `design/pixel-habit.pen` の `GraphDetail` フレーム（`c33r7`）
- **Findings**:
  - KPI 行は 4 チップ構成で、各チップが「アイコン・値・ラベル」の3要素を持つ。
  - モードは `Short/Full` の2択で、ノートに `Mode sync: KPI + heatmap` が明示されている。
  - ヒートマップは `Custom heatmap (Short / Full)` として統計行の上段に配置される。
- **Implications**:
  - 統計要件は単なる数値表示でなく KPI チップ構造まで契約化が必要。
  - 設計では `GraphDetailKpiSection` を独立境界として定義し、アイコン追加をスコープ内とする。

### 外部仕様の整合性
- **Context**: API とライブラリ利用方針を最新ドキュメントで確認するため。
- **Sources Consulted**:
  - Pixela API docs: https://docs.pixe.la/entry/post-pixel-array
  - TanStack Query docs (Query Keys): https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
  - Expo Router docs (URL parameters): https://docs.expo.dev/router/reference/url-parameters/
- **Findings**:
  - Pixela の pixel 取得系 API は `from/to` による期間取得を前提とした運用が可能。
  - TanStack Query は query key に依存条件（mode, graphId, username）を含める設計を推奨。
  - Expo Router は route/search params を画面ロジックで解釈する現行パターンと整合。
- **Implications**:
  - `short/full` を query key に含めることでキャッシュ混線を防げる。
  - route param `graphId` の必須性検証を現行どおり維持する。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存 Hook 拡張 | `useGraphDetailScreen` に mode 変換・期間算出を集約 | 変更範囲最小、既存テストを活用しやすい | Hook が肥大化しやすい | 今回の最小差分に適合 |
| Hook 分割 | 表示モード管理とデータ取得を別 hook 化 | 責務が明確で将来拡張しやすい | 変更量増、既存テスト修正量が増える | 次フェーズで検討余地 |
| 新規画面再実装 | Graph Detail を別構成で再実装 | UI 自由度が高い | 既存実装の再利用性低下、回帰リスク大 | 採用しない |

## Design Decisions

### Decision: 表示モードを `short | full` へ再定義する
- **Context**: 要件で表示モードの意味が週数（14/53）へ明示されたため。
- **Alternatives Considered**:
  1. 既存 `month/year` 名称を内部保持して表示ラベルのみ変更
  2. mode 型を `short/full` へ置換
- **Selected Approach**: mode 型を `short/full` へ置換し、期間算出も週数ベースに統一する。
- **Rationale**: 要件文言と設計・テストの用語を一致させ、意味ズレを防ぐ。
- **Trade-offs**: 既存テスト名/テストデータの更新が必要。
- **Follow-up**: `queryKeys.graphDetailPixels` の mode 型変更に合わせて関連 invalidation テストを確認。

### Decision: Graph Detail ヒートマップは `CompactHeatmap` を read-only 再利用する
- **Context**: 14週/53週表示とセルタップ追加無効を満たす UI 境界が必要。
- **Alternatives Considered**:
  1. Graph Detail 専用 heatmap コンポーネント新設
  2. `CompactHeatmap` を `onPressCell` 未指定で再利用
- **Selected Approach**: 既存 `CompactHeatmap` を再利用し、Graph Detail では `onPressCell` を渡さない。
- **Rationale**: 既存スタイル/色レベル算出ロジックと整合し、実装リスクを最小化できる。
- **Trade-offs**: 将来 Graph Detail 固有表現が必要になった場合は拡張ポイント追加が必要。
- **Follow-up**: アクセシビリティ観点で read-only 状態の明示要否を実装時に確認。

### Decision: 53週表示のデータ取得は単一クエリを維持する
- **Context**: Full 表示で取得件数が増えるため性能と複雑性のバランスが必要。
- **Alternatives Considered**:
  1. 53週を分割取得してクライアント側結合
  2. `from/to` を指定した単一取得
- **Selected Approach**: 現行 API 契約に沿って単一取得を継続。
- **Rationale**: 既存 API/React Query 構成を維持でき、エラー処理と再試行導線を再利用できる。
- **Trade-offs**: レスポンス増による描画負荷の可能性。
- **Follow-up**: 実装時に 53週データで描画時間・スクロール体感を検証し、必要なら仮想化や段階表示を検討。

## Risks & Mitigations
- Full(53週)で取得データ量が増え、初回表示が遅延するリスク — 既存ローディング表示を維持し、query key 分離で無駄な再取得を抑制する。
- mode 型変更で既存月/年前提テストが破綻するリスク — requirement ID 対応でテスト再編を実施し、UIとhookテストを同時更新する。
- Heatmap read-only 仕様が曖昧化するリスク — `onPressCell` 非提供をインターフェース契約として明示し、回帰テストでタップ追加不在を固定する。

## References
- [Pixela API docs: post pixel array](https://docs.pixe.la/entry/post-pixel-array) — `from/to` パラメータを含む pixel 取得仕様確認
- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) — mode を含むキャッシュキー設計の根拠
- [Expo Router: URL parameters](https://docs.expo.dev/router/reference/url-parameters/) — route/search params 解釈パターンの確認
