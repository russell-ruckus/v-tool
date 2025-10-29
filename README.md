# V-Tool

A client-side SVG distribution tool for creating repeating patterns with various distribution modes.

## Project Structure

```
v-tool/
├── apps/
│   └── web/              # Main web application (Vite + TypeScript)
├── packages/
│   ├── shared/           # Shared types and utilities
│   └── engine/           # Core SVG generation engine
└── docs/                 # Project documentation
```

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start dev server (runs on port 3330):

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Tech Stack

- **Language:** TypeScript 5.6.x
- **Build Tool:** Vite 5.x
- **UI Controls:** Tweakpane 4.x
- **Testing:** Vitest + Testing Library
- **CI/CD:** GitHub Actions

## Workspace Commands

Run commands in specific workspaces:

```bash
# Run dev server for web app
npm run -w apps/web dev

# Run tests for web app
npm run -w apps/web test

# Type check all workspaces
npm run typecheck --workspaces
```

## Status

**Current:** Story 1.1 - Project Bootstrap and Canary

- ✅ Monorepo structure with npm workspaces
- ✅ Vite build tooling configured
- ✅ Empty SVG canvas rendering
- ✅ Placeholder Tweakpane panel
- ✅ ESLint + Prettier configured
- ✅ GitHub Actions CI pipeline
- ✅ Basic unit tests

## License

Private project

