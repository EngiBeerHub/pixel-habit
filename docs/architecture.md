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

## Screen Development Rules

- 1画面あたり:
  - `Screen.tsx`（見た目）
  - `useScreen.ts`（ロジック）
  - `schema.ts`（必要ならzod）
- ローディング/エラー/空状態を毎画面で明示する
- 先に「動く最小」を作り、その後UI調整する

## 可読性方針（RN初心者向け）

- まずは「短いファイル」と「単純なデータフロー」を優先する
- 1ファイルに責務を詰め込みすぎない（表示・ロジック・API呼び出しを分離）
- 命名で意図が伝わることを優先する（コメントで補わなくて済む状態を目指す）

## コメント運用ルール

- コメントは日本語でよいが、「多く書く」より「必要箇所に絞って書く」を原則とする
- 「何をしているか」ではなく「なぜこの実装にしたか」を書く
- 一時対応や制約回避のコードには、前提・制約・将来の改善方針を短く残す
- 自明な処理への説明コメントは追加しない（可読性低下を防ぐ）
- TODOコメントには期限または条件を添える（例: `TODO: グラフ作成API導入後に置換`）

## Definition of Done (per feature)

- 要件の受け入れ条件を満たす
- `npm run check` が通る
- 主要操作の手動確認が完了している
- 仕様差分があれば `docs/mvp.md` に反映する

## Open Decisions

未確定事項はここに追加する:

- OpenAPI から型生成を導入するか（時期）
- 認証情報更新フローのUX
- エラーメッセージ文言ポリシー

## Change Log

- 2026-02-11: 初版作成
