# Coding Standards

Critical Fullstack Rules
- Type Sharing: Define all domain types in `packages/shared` and import from there.
- Services Only: UI never calls fetch directly; use services layer.
- Env Access: Access environment via a config module; no direct `process.env`.
- Error Shape: Use the shared `ApiError` shape consistently in UI and (future) API.
- State Updates: Never mutate state in place; use `update(patch)` with immutable merges.

Naming Conventions
- Components: PascalCase — `ObjectPanel.ts`
- Hooks/Helpers: camelCase — `useRng.ts`, `formatError.ts`
- API Routes (future): kebab-case — `/api/preset-share`
- Local Storage Keys: dot.notation — `vtool.presets`
