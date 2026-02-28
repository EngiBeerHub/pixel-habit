# Project Structure

## Organization Philosophy

Feature-first + layered ハイブリッド。  
ルート定義は `src/app`、機能実装は `src/features`、横断基盤は `src/shared` に分け、依存方向を安定化する。

## Directory Patterns

### Routing Layer
**Location**: `src/app/`  
**Purpose**: Expo Router のページ/レイアウト定義。画面ロジックを持たず feature screen を委譲する。  
**Example**: `src/app/graphs/[graphId]/index.tsx` から `GraphDetailScreen` を呼ぶ

### Feature Layer
**Location**: `src/features/<feature>/`  
**Purpose**: ユースケース単位の画面、hooks、schema、機能内コンポーネントを保持する。  
**Example**: `src/features/graphs/` で一覧・詳細・作成・編集を管理

### Shared Foundation
**Location**: `src/shared/`  
**Purpose**: API クライアント、認証、共通 UI、設定トークン、純粋関数を提供する。  
**Example**: `shared/api`（通信）、`shared/ui`（再利用 UI）、`shared/lib`（ロジック）

### Testing Utilities
**Location**: `src/test-utils/` と `e2e/`  
**Purpose**: Provider 付き描画ヘルパーと E2E フローを分離し、テスト責務を明確化する。  
**Example**: `render-with-providers.tsx` を Integration テストの標準入口にする

## Naming Conventions

- **Files**: `kebab-case`（画面は `*-screen.tsx`、hook は `use-*.ts(x)`、schema は `*-schema.ts`）
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Tests**: 実装ファイルと同ディレクトリで `*.test.ts(x)`

## Import Organization

```typescript
import { useRouter } from "expo-router"; // 外部依存
import { ScreenContainer } from "../../shared/ui/screen-container"; // 層間参照
import { graphEditSchema } from "./graph-edit-schema"; // 同一 feature 内
```

**Path Aliases**:
- 現状、`@/` のようなエイリアスは未採用。相対 import を基準とする。

## Code Organization Principles

- `app` 層は routing へ集中し、業務ロジックを直接持たない
- `features` は `shared` に依存してよいが、feature 間の直接依存は最小化する
- API 通信・query key・invalidate は `shared/api` 側へ集約し、画面側で重複定義しない
- 共通 UI パターン（カード、フォーム枠、メッセージ表示）は `shared/ui` へ寄せて再利用する
- 同じ規約に従う新規ファイル追加では steering 更新を不要とする（Golden Rule）

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
