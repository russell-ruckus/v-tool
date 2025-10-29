# Epic 4 Presets, Seeds, and SVG Upload
Goal: Enable reproducibility and reuse via presets and seeds; allow simple SVG uploads with normalization.

## Story 4.1 Presets Save/Load
As a user, I want to save and load presets, so that I can reuse configurations.

### Acceptance Criteria
1: Presets persist to local storage and survive refresh.
2: Loading a preset reproduces the scene exactly, including seed.
3: Basic preset management (rename/delete).

## Story 4.2 Seeded Randomness
As a creator, I want deterministic seeds, so that I can reproduce outputs.

### Acceptance Criteria
1: Seed field drives all randomized parameters.
2: Same seed + params → identical layout across sessions.
3: Changing seed updates layout deterministically.

## Story 4.3 SVG Upload Normalization
As a user, I want to upload a simple SVG icon, so that I can use custom shapes.

### Acceptance Criteria
1: Accepts single group/path SVGs; rejects complex files with clear reasons.
2: Normalization flattens transforms where feasible and strips scripts/filters.
3: Uploaded icon renders identically in preview and export.
