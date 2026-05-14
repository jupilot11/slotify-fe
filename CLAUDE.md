@AGENTS.md

## UI Rules

- **No logic in UI components.** Components must not contain fetching, filtering, sorting, complex state derivation, or business logic. If you find yourself writing `useEffect` with a fetch, a `.filter()`, or multi-step state transforms inside a component — stop and move it.
- **Move all logic to `hooks/` or `services/`.** Hooks own stateful logic (data fetching, derived state, event handlers). Services own pure data operations (API calls, transformations).
- **Components receive data via props or a hook call only.** A component's only job is to render what it receives.

## Code Quality Rules

- **No comments unless the WHY is non-obvious.** Don't describe what the code does — name your variables and functions well instead.
- **No premature abstractions.** Three similar lines is better than a helper that's only called in one place. Abstractions must be earned.
- **No dead code.** Don't leave commented-out blocks, unused imports, or `_unusedVar` stubs.
- **TypeScript strictly.** No `any`, no `// @ts-ignore`, no implicit returns typed as `unknown`. Use the types in `src/types/`.
- **No inline styles.** Use Tailwind classes only. Never write `style={{ ... }}` on a JSX element.
- **Error boundaries at the feature level, not everywhere.** Don't wrap every component in try/catch or error UI — handle errors where they have user-visible impact.
- **Keep files focused.** One primary export per file. If a file is doing two unrelated things, split it.