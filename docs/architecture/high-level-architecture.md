# High Level Architecture

## Technical Summary
V-Tool MVP is a client-only, static web application focused on a pure-SVG rendering pipeline to guarantee WYSIWYG preview/export parity. The frontend is implemented as a single-page application (SPA) using a modern framework with TypeScript and modular packages separating the SVG engine, samplers/transforms, renderer, presets, and export. No backend services are required for MVP; all state persists locally (localStorage) including presets and deterministic seeds. Static hosting on a global CDN provides fast delivery and preview deployments, with the option to introduce API services later for sharing, analytics, or preset sync without disrupting the core client architecture. This approach directly meets PRD goals around fidelity, performance, and rapid iteration while minimizing operational complexity and cost.

## Platform and Infrastructure Choice
Options (2–3 viable):
- Vercel (Static SPA)
  - Pros: Excellent DX, preview deployments, global edge CDN, seamless Git integration; easy future path to Edge Functions if needed.
  - Cons: Vendor lock-in concerns (minor for static assets), limited control over low-level CDN settings.
- Netlify (Static SPA)
  - Pros: Strong static hosting and build previews, forms/redirects out of the box; simple setup.
  - Cons: Fewer ecosystem integrations vs Vercel for JS meta-frameworks; similar vendor coupling.
- GitHub Pages (Static SPA)
  - Pros: Free/low-cost, simple for static sites.
  - Cons: Less robust preview workflow, fewer edge features, more manual CI wiring.

Recommendation: Vercel (Static SPA) — confirmed.

Platform record (pending confirmation):
**Platform:** Vercel (Static SPA) — confirmed
**Key Services:** Static hosting, global CDN, preview deployments (optionally Edge Functions later)
**Deployment Host and Regions:** Global edge network; regionless for static assets

## Repository Structure
**Structure:** Monorepo (npm workspaces) recommended for future growth; single-package acceptable for MVP
**Monorepo Tool:** npm workspaces (can add Turborepo later if needed)
**Package Organization:**
- apps/web — SPA (UI, routing, panels)
- packages/engine — core SVG engine (samplers, transforms, RNG)
- packages/shared — shared types/utils (scene schema, presets)
- packages/export (optional later) — export pipeline, precision controls
- packages/ui (optional later) — shared components/styles

## High Level Architecture Diagram
```mermaid
graph TD
  U[User] --> B[Browser (SPA)]
  subgraph Web App (Client Only)
    UI[Controls & Panels] --> ST[App State / Store]
    ST --> ENG[Pattern Engine<br/>(samplers, spacing, transforms)]
    ENG --> REN[SVG Renderer<br/>(<defs>/<symbol>/<use>)]
    REN --> VP[Viewport Overlay<br/>+ clipPath]
    ST --> EXP[SVG Exporter<br/>(precision, clipPath)]
    ST --> PRE[Presets (localStorage)]
    UP[SVG Upload] --> SAN[SVG Sanitizer/Normalizer]
    SAN --> SYM[Symbol Builder]
    SYM --> REN
  end
  CD[CDN + Static Hosting] --- B
  GIT[Git Repo] --> CI[Build]
  CI --> DEP[Deploy]
  DEP --> CD
```

## Architectural Patterns
- Jamstack/Static SPA: Client-only app served from CDN; add APIs later without changing core.
- Component-Based UI with TypeScript: Clear separation of concerns and maintainability.
- Functional Core, Imperative Shell: Deterministic engine logic; side effects at edges (UI, storage, export).
- Unidirectional Data Flow: Centralized state drives renderer/export; improves predictability and testing.
- Deterministic RNG (Seeded): Ensures reproducible scenes across sessions and exports.
 - SVG Symbol Reuse Pattern: Use <defs>/<symbol>/<use> to minimize DOM size and export weight.
- Input Sanitization Pipeline: Strict SVG normalization and script/filter stripping on upload.
 - Orthographic Projection (MVP): 2D view transforms (pan/zoom) only; no perspective/occlusion.
