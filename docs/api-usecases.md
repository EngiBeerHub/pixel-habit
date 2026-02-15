# APIユースケース一覧（UX再設計版）

このドキュメントは、`Home` / `Settings` の2タブ構成に合わせたAPI設計メモです。

## 前提

- API仕様: `docs/pixela.openapi.yaml`
- 認証: `X-USER-TOKEN`
- 認証情報保持: `expo-secure-store`
- サーバー状態管理: React Query
- API層シグネチャ: `src/shared/api/graph.ts` / `pixel.ts` / `user.ts` は業務パラメータのみを受け取る
- 認証注入: `AuthSessionProvider` が `client-auth-context` と同期し、`pixelaRequest` がトークンを自動注入する

## MVPで実装するユースケース

### UC-01 ログイン情報を保存する

- 目的:
  - 利用開始に必要な `username` / `token` を保持する
- 主画面:
  - `認証ハブ` / `ログイン`
- 実装:
  - `src/shared/storage/auth-storage.ts`

### UC-02 グラフ一覧を取得する（Home）

- API:
  - `GET /v1/users/{username}/graphs`
- 主画面:
  - `Home`
- 操作:
  - 初回読み込み
  - pull-to-refresh
  - 再試行

### UC-03 ピクセルを追加する（クイック追加/詳細入力）

- API:
  - `POST /v1/users/{username}/graphs/{graphID}`
- 主画面:
  - `Home` の Bottom Sheet
  - `/graphs/[graphId]/add`（詳細）
- UX:
  - 通常は Bottom Sheet で `date` / `quantity` を入力
  - `quantity` は 1以上のみ入力可能（0は禁止）
  - 未入力判定は「当日レコードが存在しない」場合のみ
  - 仕様上 `quantity <= 0` は生成しないが、受信した場合は防御的に未入力相当で扱う
  - Homeヒートマップセルから起動した場合は、タップした日付を初期値に設定する
  - 追加成功時はToastのみで通知する（Inline成功表示は行わない）
  - `optionalData` はMVPスコープ外とし、必要時は後続フェーズで検討する

## 早めに追加するユースケース（MVP後半）

### UC-04 グラフを作成する

- API:
  - `POST /v1/users/{username}/graphs`
- 主画面:
  - `Home` の FAB
- 入力:
  - `id` / `name` / `unit` / `type` / `timezone` / `color`
- UX要件:
  - `color` はテーマ選択UIで選べること
  - 作成成功後、選択色をカードとヒートマップに反映すること

### UC-05 グラフを更新する

- API:
  - `PUT /v1/users/{username}/graphs/{graphID}`
- 主画面:
  - `/graphs/[graphId]` の `...` メニュー
- 入力:
  - `name` / `unit` / `color` など
- UX要件:
  - テーマ色変更時に、画面再訪問なしで一覧表示に反映されること

### UC-06 グラフを削除する

- API:
  - `DELETE /v1/users/{username}/graphs/{graphID}`
- 主画面:
  - `/graphs/[graphId]` の `...` メニュー（確認ダイアログ必須）

### UC-07 日次記録を更新する

- API:
  - `PUT /v1/users/{username}/graphs/{graphID}/{yyyyMMdd}`
- 主画面:
  - `/graphs/[graphId]/pixels/[date]`
- 導線:
  - `/graphs/[graphId]` の記録一覧行タップ
- UX要件:
  - 成功時はGraph詳細へ戻り、対象グラフの関連クエリを再取得する

### UC-08 日次記録を削除する

- API:
  - `DELETE /v1/users/{username}/graphs/{graphID}/{yyyyMMdd}`
- 主画面:
  - `/graphs/[graphId]/pixels/[date]`（確認ダイアログ必須）
- 導線:
  - `/graphs/[graphId]` の記録一覧行タップ
- UX要件:
  - 成功時はGraph詳細へ戻り、対象グラフの関連クエリを再取得する

### UC-13 グラフ詳細を期間別に確認する（Month/Year）

- API:
  - `GET /v1/users/{username}/graphs/{graphID}/pixels?withBody=true&from={yyyyMMdd}&to={yyyyMMdd}`
- 主画面:
  - `/graphs/[graphId]`
- UX:
  - `Month` は暦月、`Year` は暦年の範囲で取得する
  - 記録一覧専用画面は使わず、期間内一覧から記録詳細へ遷移する
  - 取得結果からLight統計（合計・記録日数・最大値）を算出して表示する
  - 取得失敗時は再試行導線を表示する

## Settingsタブのユースケース

### UC-09 ユーザープロファイルを開く

- API:
  - なし（外部ブラウザ遷移）
- 主画面:
  - `Settings > ユーザー`

### UC-10 トークン変更

- API:
  - `PUT /v1/users/{username}`（token更新）
- 主画面:
  - `Settings > ユーザー`

### UC-11 ログアウト

- API:
  - なし（ローカル認証情報削除）
- 主画面:
  - `Settings > ユーザー`

### UC-12 ユーザー削除

- API:
  - `DELETE /v1/users/{username}`
- 主画面:
  - `Settings > ユーザー`
- 備考:
  - 危険操作として最下部に分離

## ヒートマップ表示方針とAPI

- Home:
  - 自前描画を基本とし、必要データはピクセル一覧APIで取得
  - API: `GET /v1/users/{username}/graphs/{graphID}/pixels?withBody=true&from={yyyyMMdd}&to={yyyyMMdd}`
  - 表示期間: 14週（98日）
  - 段階表現: 5段階（`0=薄灰`, `1-4=テーマ色の濃淡`）
  - 取得期間: 表示期間と一致する14週分を `from/to` で指定する
  - データ再取得: Homeのpull-to-refreshと記録追加成功時に、一覧とカード単位のヒートマップデータを同期再取得する
- Graph詳細:
  - APIはHomeと同じ `getPixels` を使い、`Month/Year` で `from/to` の意味を切り替える
  - Home固定14週とは別の期間ロジックで、暦月/暦年を優先する
- カラー反映:
  - グラフ定義の `color` を表示テーマの単一ソースとして扱う
  - カード/ヒートマップ/操作UIの色トーンを同じマッピングで描画する

## エラーハンドリング方針

- APIエラーは共通クライアントで `PixelaApiError` に正規化
- UIでは再試行導線を必ず表示
- 認証情報不足時は `認証ハブ` に戻す
- 削除系は通信失敗時に状態反映しない（楽観更新はしない）

## TODO（要判断）

- Bottom Sheet の `optionalData` を将来追加するか
- OpenAPI型自動生成を導入する時期

## 更新ルール

- API追加・変更時は本ファイルのユースケースも同コミットで更新する
- 画面導線が変わったら、`docs/screen-flow.md` とセットで更新する
