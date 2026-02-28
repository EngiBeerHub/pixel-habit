# Research & Design Decisions

## Summary
- **Feature**: `native-tab-navigation`
- **Discovery Scope**: Extension（既存 Expo Router ナビゲーションの拡張/整理）
- **Key Findings**:
  - Expo Router Native Tabs をタブ基盤として固定しても、既存の nested Stack 構成と両立可能。
  - Expo Router の Stack/Tabs で Large Title と screen単位ヘッダー制御は継続採用可能。
  - `@react-native-menu/menu` はネイティブメニュー実現に適合するが、Expo Go では挙動制約があり Dev Client/Prebuild前提の運用が必要。
  - 主要ギャップは実装不足より、レイアウト階層の責務境界と回帰テスト不足。

## Research Log

### Expo Router のヘッダー/タブ方針
- **Context**: Requirement 1〜3（ネイティブタブ + Large Title + 標準バック）の実現可能性確認
- **Sources Consulted**:
  - Expo Router Stack docs: https://docs.expo.dev/router/advanced/stack/
  - Expo Router Native Tabs docs: https://docs.expo.dev/router/advanced/native-tabs/
  - Expo Router Tabs docs: https://docs.expo.dev/router/advanced/tabs/
- **Findings**:
  - Expo Router Native Tabs は tabs レイアウトの主導線として適用でき、screen単位ヘッダー制御と両立する。
  - Stack で `headerLargeTitle`・`headerBackButtonDisplayMode`・`headerRight` を screen 単位で制御可能。
  - Tabs + nested Stack はタブトップと詳細遷移を分離しやすい。
  - ネイティブ寄りUXは layout 側で静的設定を持つほど安定する。
- **Implications**:
  - 静的ヘッダー設定は `src/app/**/_layout.tsx` へ寄せ、動的タイトル/動的メニューのみ画面hook側で設定する設計が妥当。

### @react-native-menu/menu の互換性
- **Context**: Requirement 3.3, 5.2（右上メニューの標準化とフォールバック）
- **Sources Consulted**:
  - GitHub README: https://github.com/react-native-menu/menu
- **Findings**:
  - iOS/Android ネイティブメニューに対応。
  - Expo 利用時は config plugin + prebuild/run（Dev Client）運用が明示される。
- **Implications**:
  - Expo Go を主導線にするとメニュー要件が不安定化するため、Dev Client を標準検証環境として design に明記。
  - Expo Go では fallback action path（Dialog）を定義して機能喪失を防ぐ。

### 既存コードの統合制約
- **Context**: Brownfield適用時の影響範囲確認
- **Sources Consulted**:
  - `src/app/_layout.tsx`
  - `src/app/(tabs)/_layout.tsx`
  - `src/app/(tabs)/home/_layout.tsx`
  - `src/app/(tabs)/settings/_layout.tsx`
  - `src/features/graphs/hooks/use-graph-detail-screen.tsx`
- **Findings**:
  - 既存構成は要件適合に近いが、Graph Detail ヘッダー設定が hook 側に集中し、責務境界が崩れやすい。
  - 回帰は「戻る導線消失」「Large Title重複」「メニュー非表示」で発生しやすい。
- **Implications**:
  - 実装の主眼は新規機能追加ではなく、境界明確化と回帰固定化。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Extend Existing | 現在の layout/hook を最小変更で維持 | 低コスト、変更影響が小さい | 再発ポイントが残る | 短期向け |
| New Navigation Module | shared/navigation へ設定抽象を新設 | 規約を強制しやすい | 過抽象化、移行コスト | 長期向けだが現時点過剰 |
| Hybrid (Selected) | 静的=layout、動的=hook の二層運用 | 実装負荷と安定性のバランス良好 | 境界規約の文書化が必須 | 今回採用 |

## Design Decisions

### Decision: ヘッダー責務を「静的/動的」で分離する
- **Context**: iOS/Androidで標準的な遷移と見た目を維持したい
- **Alternatives Considered**:
  1. すべて layout に集約
  2. すべて画面 hook で setOptions
- **Selected Approach**: 静的項目（title mode, back policy, animation baseline）は layout。動的項目（graphName, menu actions）は hook。
- **Rationale**: 再発しやすい基本挙動を layout で固定しつつ、画面依存の動的情報は最小限の imperative 設定で扱える。
- **Trade-offs**: 完全宣言化ではないが、再現性と柔軟性のバランスが良い。
- **Follow-up**: 変更時に「layoutで管理すべき項目か」をレビュー項目へ追加。

### Decision: Graph Detail の管理操作は MenuView 継続 + Fallback 定義
- **Context**: 右上 `...` をネイティブ挙動で提供したい
- **Alternatives Considered**:
  1. HeroUI Popover/Menu に全面置換
  2. RN独自 View メニュー
- **Selected Approach**: `@react-native-menu/menu` を継続採用し、ランタイム制約時のみ Dialog fallback。
- **Rationale**: iOS/Android 標準感を最も再現しやすい。
- **Trade-offs**: Expo Go で制約があるため、検証環境を明示管理する必要がある。
- **Follow-up**: 手動スモークに「Dev Client実機でメニュー表示」を追加。

### Decision: Requirement-to-Test traceability を設計段階で固定
- **Context**: ナビゲーション回帰が再発しやすい
- **Alternatives Considered**:
  1. 実装後にテストを追加
  2. 設計で要件IDとテスト責務を先に結びつける
- **Selected Approach**: 設計文書に ID マッピングを持ち、Task生成の入力にする。
- **Rationale**: 回帰検知漏れを防止できる。
- **Trade-offs**: 文書更新コストが増える。
- **Follow-up**: タスク生成時に ID を保ったままテストタスクへ展開する。

## Risks & Mitigations
- Expo Go でメニューが表示されないリスク — Dev Client を検証標準にし、Expo Go fallback を定義する。
- Header 設定の二重管理再発リスク — 静的/動的境界ルールを design.md と architecture.md に反映する。
- タブ/バック挙動の回帰リスク — layout レベルのナビテストを追加し、screenテストのみ依存を避ける。

## Operational Notes
- Graph Detail の `...` は iOS/Android の Dev Client / Standalone では `@react-native-menu/menu` を使用する。
- Expo Go またはネイティブメニュー非対応ランタイムでは、同じ `...` ボタン押下で Dialog fallback を開き、編集/削除導線を維持する。
- 既知制約: fallback はネイティブ長押し/アンカー表示ではなくモーダル操作になるが、編集/削除の機能等価性を優先する。

## References
- [Expo Router Stack](https://docs.expo.dev/router/advanced/stack/) — Stackヘッダーと戻る導線の公式仕様
- [Expo Router Native Tabs](https://docs.expo.dev/router/advanced/native-tabs/) — ネイティブタブ方針
- [Expo Router Tabs](https://docs.expo.dev/router/advanced/tabs/) — Tabs + nested stack パターン
- [react-native-menu/menu](https://github.com/react-native-menu/menu) — iOS/Androidネイティブメニュー実装とExpo運用
