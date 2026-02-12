# E2E テスト（Maestro）

## 運用方針（現時点）
- MVP期間は E2E を保留運用とする
- 日常開発の回帰検知は Unit/Integration（Jest + RNTL）を優先する
- E2E は必要時のみ手動スモークとして実行する

## 前提
- Maestro CLI がインストール済みであること
- iOS Simulator または Android Emulator が起動済みであること
- 別ターミナルで Expo アプリを起動していること（`npm run ios` または `npm run android`）
- テスト用 Pixela アカウントと、最低1件のグラフが事前作成済みであること

## 実行方法
1. アプリを起動します。
2. 以下を実行します（認証情報は環境変数を `maestro -e` へ受け渡します）。

```bash
PIXELA_USERNAME=your-username PIXELA_TOKEN=your-token npm run e2e:run
```

## シナリオ
- `e2e/flows/auth-login.yaml`: 認証ハブからログイン画面へ遷移し、Home 到達までを確認
- `e2e/flows/home-quick-add.yaml`: Home のクイック追加導線と成功フィードバック確認

## 補足
- 認証情報は `package.json` の `e2e:run` スクリプト経由で Maestro に注入されます。
- `@` を含むトークンは必要に応じてクォートしてください（例: `PIXELA_TOKEN='calcio32@'`）。
- E2E は端末状態・通信状況に影響されるため、失敗時は再実行して再現性を確認してください。
