# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router routes and layouts (e.g., `_layout.tsx`, `(tabs)/`, `+html.tsx`, `+not-found.tsx`, `modal.tsx`). Screens live here.
- `components/`: Reusable UI and hooks (platform overrides like `.web.ts(x)` are supported).
- `constants/`: App-wide tokens (e.g., `Colors.ts`).
- `assets/`: Images and static files referenced by `app.json`.
- Config: `app.json`, `tsconfig.json` (TypeScript strict), `expo-env.d.ts`.
- Tests: Co-located (e.g., `components/__tests__/...`).

## Build, Test, and Development Commands
- `npm start`: Start the Expo dev server (tunnel enabled).
- `npm run android` | `npm run ios` | `npm run web`: Launch platform targets.
- `npm test`: Run Jest (via `jest-expo`) in watch mode.
- Tips: `npx expo start --clear` to reset Metro cache when builds misbehave.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict: true`.
- Imports: Use path alias `@/` (configured in `tsconfig.json`).
- Files: Components `PascalCase.tsx`, hooks `useXxx.ts`, constants `PascalCase.ts`.
- Routes: Follow Expo Router patterns (`_layout.tsx`, groups like `(tabs)`, special files `+html.tsx`, `+not-found.tsx`).
- Platform files: Prefer platform suffixes (e.g., `useClientOnlyValue.web.ts`).
- Formatting: 2-space indent, single quotes, semicolons; keep diffs small and focused.

## Testing Guidelines
- Framework: Jest with `jest-expo` and `react-test-renderer`.
- Location: Co-locate tests under `__tests__` or `*.test.ts(x)`.
- Style: Use snapshot tests for presentational components and targeted unit tests for logic.
- Run: `npm test`. Aim for meaningful coverage on new/changed code; update snapshots intentionally.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (e.g., `feat: add streak badge`, `fix: handle dark mode`).
- PRs: Provide a concise summary, linked issues, steps to validate, and screenshots/GIFs for UI changes. Keep PRs scoped; include any config or doc updates.

## Security & Configuration Tips
- Do not commit secrets. Use Expo env conventions; only `EXPO_PUBLIC_` vars are exposed to the client.
- Reference images from `assets/` and declared paths in `app.json`.
- Avoid blocking the main thread; prefer lightweight components and memoization where appropriate.

