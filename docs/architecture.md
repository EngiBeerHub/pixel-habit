# Architecture (Lightweight)

このドキュメントは実装開始前に「迷いやすい方針」だけ固定するためのものです。
詳細設計書にはしません。迷ったときの判断基準として使います。

## Stack Decisions

- Framework: Expo + React Native + Expo Router
- UI: `heroui native` + `uniwind`
- Data Fetching / Cache: `@tanstack/react-query`
- Form: `react-hook-form`
- Validation: `zod`
- Secure Storage: `expo-secure-store`
- Lint/Format: Ultracite (Biome)

## Platform Scope

- 主対象は Expo + React Native で開発する iOS/Android モバイルアプリ
- Web 対応は MVP の対象外とし、モバイルMVP完了後に別途判断する

## Project Structure (proposed)

`src/` 配下の責務を先に分ける:

- `src/app/`: 画面（ルーティング）
- `src/features/`: ユースケース単位のUI/ロジック
  - 画面固有コンポーネントは `src/features/<feature>/components/` に分離する
- `src/shared/api/`: APIクライアント、型、エラーハンドリング
- `src/shared/lib/`: 共通ユーティリティ
- `src/shared/ui/`: 汎用UIコンポーネント
- `src/shared/config/`: 環境値、定数

## Data Flow

1. 画面 (`src/app/*`) で feature コンポーネントを呼ぶ
2. feature 内で hook を使って入力/表示を制御
3. APIアクセスは `src/shared/api/*` に集約
4. サーバー状態は React Query で管理
5. 接続情報（token等）は Secure Store で管理

## API Client Rules

- Pixela API 呼び出しは直接画面から行わない
- `fetch` は `src/shared/api/client.ts` に集約する
- 全レスポンスで最低限のエラーマッピングを行う
- バリデーションが必要な入出力は `zod` で定義する

## State Management Rules

- サーバー状態: React Query
- 一時的なフォーム状態: react-hook-form
- アプリ全体の軽量状態（例: auth context）: React Context
- Contextで辛くなったら必要箇所に限定して Zustand を導入

## 認証情報読み込みルール

- 画面から認証情報へアクセスするときは `useAuthSession`（`src/shared/auth/use-auth-session.ts`）を使う
- 画面から `useAuthCredentialsQuery` を直接呼ばない（`AuthSessionProvider` 内部専用）
- `useEffect + setState` での手動hydrateは新規実装しない
- 画面から認証必須APIを呼ぶときは `useAuthedPixelaApi`（`src/shared/api/authed-pixela-api.ts`）を使い、`token/username` を直接渡さない
- 画面から `loadAuthCredentials()` を直接呼ばない（認証の読み込み責務は `AuthSessionProvider` に集約する）
- 認証必須APIで認証情報がない場合は `AuthRequiredError` を投げ、画面側は既存エラーメッセージ導線で表示する
- `AuthSessionProvider` は `authCredentials` query の読み込み・保存同期・invalidate責務を持つ
- `query key / retry / staleTime` は `useAuthCredentialsQuery` に集約し、画面側で再定義しない
- 既ログイン時に表示不要な認証画面は `useAuthSession` の `status/credentials` で Home へリダイレクトする
- 次フェーズで `src/shared/api/*.ts` の公開シグネチャも認証注入前提へ簡素化する

## Screen Development Rules

- 1画面あたり:
  - `Screen.tsx`（見た目）
  - `useScreen.ts`（ロジック）
  - `schema.ts`（必要ならzod）
- ローディング/エラー/空状態を毎画面で明示する
- 先に「動く最小」を作り、その後UI調整する
- 画面ファイル内に大きな子コンポーネントを内包しない（再利用しない場合も `components/` へ分離）

## 可読性方針（RN初心者向け）

- まずは「短いファイル」と「単純なデータフロー」を優先する
- 1ファイルに責務を詰め込みすぎない（表示・ロジック・API呼び出しを分離）
- 命名で意図が伝わることを優先する（コメントで補わなくて済む状態を目指す）

## 重複管理ルール（DRY）

- 同じロジックが2画面以上で必要になった時点で `src/shared/lib/` へ切り出す
- 切り出した共通関数にはDocコメントを付け、利用側ではローカル再実装しない
- `src/shared/ui/` 配下で同じユーティリティ処理（例: className結合）が2回以上出たら `src/shared/lib/` へ移動する
- className結合は `src/shared/lib/class-name.ts` の `mergeClassNames` を使用し、各ファイルで再定義しない

## コメント運用ルール

- コメントは日本語でよいが、UIコンポーネントではビュー構造を追える粒度で十分に付与する
- 「何をしているか」ではなく「なぜこの実装にしたか」を書く
- 一時対応や制約回避のコードには、前提・制約・将来の改善方針を短く残す
- 自明な処理への説明コメントは追加しない（可読性低下を防ぐ）
- TODOコメントには期限または条件を添える（例: `TODO: グラフ作成API導入後に置換`）

### View構造コメントルール

- 画面/コンポーネントの `return` 内は、主要ブロックごとに「何の領域か」を先頭コメントで示す
- 条件分岐で表示が切り替わる箇所は、分岐の意図（例: ローディング、空状態、エラー）をコメントで明示する
- 入力フォームは `入力本体 / バリデーションエラー / 成功・失敗メッセージ / アクション` をコメントで区切る
- コメントは構造の見取り図として機能させ、実装と同コミットで更新する
- このルールは `auth` / `settings` / `graphs` / `pixels` の全画面に適用する

## HeroUI/Uniwind Styling Rules

`heroui-native` と `uniwind` の公式方針に合わせ、以下を適用する。

### Allowed

- UIコンポーネントは `heroui-native` を第一選択で使用する
- 見た目は `uniwind` の `className` で構成する
- 色・余白・角丸・サイズは `src/shared/config/ui-tokens.ts` を単一ソースとして参照する
- 共通化可能な見た目は `src/shared/ui/` へ切り出す
- 計算が必要なレイアウト（ヒートマップ座標など）のみ `style` を許可する

### Discouraged

- 画面内で同じトーンの色や余白を直接ハードコードする
- 画面ごとに独自コンテナ/独自カードを増やす
- 同じフォーム構造を各画面で再実装する

### Forbidden

- `heroui-native` で代替可能な要素を理由なく素のRNコンポーネントで新規実装する
- 計算不要なプロパティをインライン `style` で上書きする
- テーマ値を `src/shared/config/ui-tokens.ts` を経由せず直接重複定義する

### Review Checklist

- 追加UIは `heroui-native` ベースで構成されているか
- 画面内の重複スタイルは `src/shared/ui/` へ集約されているか
- 色・余白・角丸・ヒートマップサイズはトークン参照になっているか
- インライン `style` は計算レイアウトに限定され、理由がコメントで明示されているか
- `src/shared/ui/` 内でユーティリティ関数が重複定義されていないか

## Docコメントルール

- `export` の有無に関係なく、関数・型・コンポーネント・主要定数には Docコメントを付ける
- Docコメントは1〜3行で、責務と利用意図を簡潔に書く
- パラメータや返り値の意味がコードだけで自明でない場合は `@param` / `@returns` を追加する
- 実装変更で責務が変わったら、同じコミット内でDocコメントも更新する

## テスト戦略

- Unit: 純粋関数や日付/変換ロジックを `*.test.ts` で検証する
- Integration: 画面の入力検証・分岐描画・エラー表示を RNTL で検証する
- E2E: Maestro は導入済みだが、MVP期間は保留運用とする
- Snapshot テストは原則採用しない（Expoガイド方針に合わせる）

### テスト運用ルール

- 仕様変更時は、影響する Unit/Integration/E2E のどれを更新するかをコミット内で明示する
- 画面の重要分岐（loading/error/empty/success）は最低1つ以上 Integration テストで担保する
- 日常開発の品質ゲートは `npm run test` / `npm run check` / `npx tsc --noEmit` を必須とする
- E2E はリリース前の手動スモークでのみ実行し、失敗時は本番ブロッカーにしない

## Definition of Done (per feature)

- 要件の受け入れ条件を満たす
- `npm run check` が通る
- `npm run test` が通る
- 主要操作の手動確認が完了している
- 仕様差分があれば `docs/mvp.md` に反映する

## Open Decisions

未確定事項はここに追加する:

- OpenAPI から型生成を導入するか（時期）
- 認証情報更新フローのUX
- エラーメッセージ文言ポリシー

## Change Log

- 2026-02-11: 初版作成
