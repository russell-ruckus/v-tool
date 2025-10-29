# Epic 1 Foundation & Core SVG Engine
Goal: Establish project scaffolding and implement the core SVG engine with basic shapes and spacing functions to enable initial pattern generation.

## Story 1.1 Project Bootstrap and Canary
As a developer, I want a minimal client app shell and build tooling, so that I can render a canary page and iterate quickly.

### Acceptance Criteria
1: App builds and serves a simple canvas with placeholder UI panels.
2: Project includes linter/formatter and basic CI checks (build only).
3: Canary page renders an empty SVG scene without errors.

## Story 1.2 Basic Shapes via <defs>/<use>
As a user, I want to select a Square, Circle, or Triangle, so that I can begin generating patterns.

### Acceptance Criteria
1: Shapes render via <defs>/<symbol>/<use> with correct geometry.
2: Switching shapes updates the scene without full re‑render jank.
3: Structure verified in DOM and export mock.

## Story 1.3 Spacing Functions and Linear Path Sampler
As a creator, I want linear path placement with spacing functions, so that I can control instance distribution.

### Acceptance Criteria
1: Linear path sampler places N instances deterministically.
2: Spacing functions (linear/ease‑in/ease‑out) alter positions as expected.
3: No frame drops at ~1–2k instances on mid‑tier hardware.
