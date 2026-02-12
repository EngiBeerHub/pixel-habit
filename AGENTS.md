# Repository Guidelines

## Project Structure & Module Organization
- App source lives in `src/`.
- Route screens follow Expo Router conventions under `src/app/` (for example, `src/app/index.tsx` and `src/app/_layout.tsx`).
- Global styling is in `src/global.css`; Uniwind type declarations are in `src/uniwind-types.d.ts`.
- API contract references live in `docs/` (`docs/pixela.openapi.yaml`).
- Root config files include `app.json`, `metro.config.js`, `tsconfig.json`, and `biome.jsonc`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run start`: start Expo dev server.
- `npm run ios` / `npm run android` / `npm run web`: launch the app on a target platform.
- `npm run check`: run Ultracite lint/format checks.
- `npm run fix`: auto-fix formatting and lint issues.
- Optional diagnostics: `npm exec -- ultracite doctor`.

## Coding Style & Naming Conventions
- Language: TypeScript + React Native (Expo Router).
- Use 2-space indentation and keep code Biome/Ultracite-clean before submitting.
- Prefer explicit, readable names (`HabitCard.tsx`, `fetchPixelaGraph`), `const` by default, and `unknown` over `any`.
- Keep components functional, hooks at top level, and avoid nested component definitions.
- Follow file naming by role:
  - Routes: Expo Router names (`index.tsx`, `_layout.tsx`, segment folders).
  - Shared modules/components: `PascalCase` for components, `camelCase` for utilities.

## Expo Document
- [llms.txt](https://docs.expo.dev/llms.txt): A list of all available documentation files
- [llms-full.txt](https://docs.expo.dev/llms-full.txt): Complete documentation for Expo, including Expo Router, Expo Modules API, development process, and more
- [llms-eas.txt](https://docs.expo.dev/llms-eas.txt): Complete documentation for the Expo Application Services (EAS)
- [llms-sdk.txt](https://docs.expo.dev/llms-sdk.txt): Complete documentation for the latest Expo SDK

## UI Design Guidelines
- Prefer using HeroUI Native.

### Document

#### HeroUI Native
<!-- HEROUI-NATIVE-AGENTS-MD-START -->
[HeroUI Native Docs Index]|root: ./.heroui-docs/native|STOP. What you remember about HeroUI Native is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --native --output AGENTS.md|components/(buttons):{button.mdx,close-button.mdx}|components/(data-display):{chip.mdx}|components/(feedback):{skeleton-group.mdx,skeleton.mdx,spinner.mdx}|components/(forms):{checkbox.mdx,control-field.mdx,description.mdx,field-error.mdx,input-otp.mdx,input.mdx,label.mdx,radio-group.mdx,select.mdx,switch.mdx,text-area.mdx,text-field.mdx}|components/(layout):{card.mdx,separator.mdx,surface.mdx}|components/(media):{avatar.mdx}|components/(navigation):{accordion.mdx,tabs.mdx}|components/(overlays):{bottom-sheet.mdx,dialog.mdx,popover.mdx,toast.mdx}|components/(utilities):{pressable-feedback.mdx,scroll-shadow.mdx}|getting-started/(handbook):{animation.mdx,colors.mdx,composition.mdx,portal.mdx,provider.mdx,styling.mdx,theming.mdx}|getting-started/(overview):{design-principles.mdx,quick-start.mdx}|getting-started/(ui-for-agents):{agent-skills.mdx,agents-md.mdx,llms-txt.mdx,mcp-server.mdx}|releases:{beta-10.mdx,beta-11.mdx,beta-12.mdx,beta-13.mdx}
<!-- HEROUI-NATIVE-AGENTS-MD-END -->

#### Uniwind
- https://docs.uniwind.dev/llms.txt

## Testing Guidelines
- Unit/Integration は Jest + React Native Testing Library を使用する。
- E2E は Maestro を使用するが、MVP期間は保留運用（必要時のみ手動実行）とする。
- テストファイルは `*.test.ts` / `*.test.tsx` で、対象コード近傍または `src/__tests__/` に配置する。
- 実行コマンド:
  - `npm run test`
  - `npm run test:watch`
  - `npm run test:ci`
  - `npm run e2e:run`（手動スモーク用）
- 最小必須テストセット:
  - `src/shared/lib/date.test.ts`
  - `src/shared/lib/class-name.test.ts`
  - `src/features/graphs/components/compact-heatmap.test.tsx`
  - `src/features/auth/auth-settings-screen.test.tsx`
  - `src/features/auth/auth-sign-up-screen.test.tsx`
  - `src/features/graphs/components/graph-card.test.tsx`
- Keep tests deterministic; avoid `.only`/`.skip`; use async/await over done-callback patterns.

## Commit & Pull Request Guidelines
- Current history uses short, imperative messages (for example, `installed ultracite`, `pixela api openapi yaml`).
- Recommended commit format: imperative summary with optional scope, e.g. `feat(router): add habit detail route`.
- PR checklist: clear purpose and key changes, linked issue/task when available, screenshots/recordings for UI work (iOS/Android/Web as relevant), and confirmation that `npm run check` (plus tests, if added) pass.

## Security & Configuration Tips
- Do not commit secrets or tokens; use Expo environment configuration for runtime values.
- Validate external API inputs (especially Pixela-related payloads) and surface failures with descriptive errors.

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npm exec -- ultracite fix`
- **Check for issues**: `npm exec -- ultracite check`
- **Diagnose setup**: `npm exec -- ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

Most formatting and common issues are automatically fixed by Biome. Run `npm exec -- ultracite fix` before committing to ensure compliance.
