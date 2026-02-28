# Technology Stack

## Architecture

Expo Router を入口に、`src/app`（ルーティング）→ `src/features`（ユースケース UI/ロジック）→ `src/shared`（横断基盤）へ責務分離する構成。  
サーバー状態は React Query、フォーム状態は react-hook-form + zod、認証セッションは React Context で扱う。

## Core Technologies

- **Language**: TypeScript（`strict: true`）
- **Framework**: Expo 54 + React Native 0.81 + Expo Router 6
- **Runtime**: React 19

## Key Libraries

- `@tanstack/react-query`: API キャッシュ、再取得、invalidate の標準化
- `react-hook-form` + `@hookform/resolvers` + `zod`: 入力バリデーションとフォーム管理
- `heroui-native` + `uniwind` + `tailwindcss v4`: UI コンポーネントとスタイリング基盤
- `expo-secure-store`: 認証情報の端末保存

## Development Standards

### Type Safety

- TypeScript strict を前提に `any` 依存を避ける
- API 入出力やフォーム値は zod schema で境界を明示する

### Code Quality

- Biome（Ultracite preset）を品質ゲートとして使用
- 画面に近い層のスタイルは UI トークン経由を優先し、インライン style を最小化する

### Testing

- `jest-expo` + Testing Library（React Native）で Unit/Integration を実施
- `src/test-utils/render-with-providers.tsx` で Provider 依存を共通化
- E2E は Maestro フローを保持し、主に手動スモークで活用

## Development Environment

### Required Tools

- Node.js / npm
- Expo CLI（`npx expo`）
- iOS/Android の実機または Simulator/Emulator

### Common Commands

```bash
# Dev
npm run start

# Platform
npm run ios
npm run android

# Quality
npm run check
npm run test
npm run test:ci
```

## Key Technical Decisions

- API 呼び出しは `src/shared/api/client.ts` に集約し、画面から直接 `fetch` しない
- React Query key は `src/shared/api/query-keys.ts` を単一ソースにする
- 認証必須 API は `useAuthedPixelaApi` 経由で呼び、画面層で token/username を直接受け回さない
- UI は `heroui-native` を第一選択にし、共通 UI は `src/shared/ui` へ寄せる

---
_Document standards and patterns, not every dependency_
