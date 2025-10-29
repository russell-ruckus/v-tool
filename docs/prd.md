# V-Tool Product Requirements Document (PRD)

Source: docs/brief.md

Status: Draft v0.2 (template-aligned)
Owner: PM (tbd)
Target MVP: 6–8 weeks

## Goals and Background Context

### Goals
- Deliver a pure‑SVG pattern generator with WYSIWYG preview/export parity.
- Enable rapid procedural exploration with precise controls and clean SVG output.
- Support basic shapes and simple SVG uploads with deterministic seeds and presets.
- Achieve 60 FPS interaction up to ~5k instances on desktop browsers.
- Ship MVP within 6–8 weeks and validate with design partners.

### Background Context
Designers and creative coders spend significant time crafting precise vector patterns. Traditional vector tools are manual and slow for procedural exploration, while many generative tools preview in a different engine than export, leading to mismatches. V‑Tool focuses on a vector‑first, pure‑SVG pipeline to ensure preview/export parity, fast iteration, and clean, production‑ready exports—supporting brand‑safe reuse via presets and seeds.

The MVP targets core distribution methods (Path: Linear/Sine; Particle: grid jitter/random), essential transforms (depth→scale, rotation), styling, a fixed export viewport, and deterministic presets to maximize immediate value while keeping scope tight.

### Change Log
| Date       | Version | Description                    | Author |
|------------|---------|--------------------------------|--------|
| 2025-10-29 | v0.3    | Target set to Web app; moved analytics to Stretch; added parameter locking to Stretch | Codex  |
| 2025-10-29 | v0.2    | Template-aligned restructure   | Codex  |
| 2025-10-29 | v0.1    | Initial PRD draft from brief   | Codex  |

## Requirements

### Functional (FR)
- FR1: Provide basic shapes (Square, Circle, Triangle) selectable as the object source.
- FR2: Accept a single uploaded SVG, normalize to a simple group/path, and reject unsupported complexity with clear messaging.
- FR3: Offer Path distribution modes: Linear and Sine, each with adjustable frequency/instance count.
- FR4: Offer Particle distribution modes: Grid with jitter and Random scatter, with density and jitter controls.
- FR5: Implement spacing functions (linear, ease‑in, ease‑out) applicable to supported modes.
- FR6: Map depth parameter (0..1) to per‑instance scale; ensure consistent render order relative to depth when necessary.
- FR7: Provide per‑instance rotation controls (fixed value and randomized within a range, optionally seeded).
- FR8: Provide styling controls: fill, stroke, and background color.
- FR9: Provide a fixed viewport overlay with orientation (landscape/portrait) and aspect ratios (16:9, 1:1, 4:3).
- FR10: Export to SVG using <defs>/<symbol>/<use> to minimize duplication and file size.
- FR11: Apply clipPath to crop export exactly to the viewport bounds.
- FR12: Provide numeric precision control for export (default optimized for size/fidelity balance).
- FR13: Save/load presets of all scene parameters locally.
- FR14: Support seeded randomness to deterministically reproduce scenes.
- FR15: Provide validation and helpful errors for unsupported uploads and out‑of‑range parameters.
 - FR16: Provide canvas view controls: pan (drag/X‑Y), zoom (0.1×–10×), overlay visibility toggle, and “Fit to Viewport”; view transforms must not affect export.

### Non Functional (NFR)
- NFR1: Maintain ~60 FPS interaction up to ~5k instances on mid‑tier desktop hardware.
- NFR2: Ensure exported SVGs typically remain under ~150KB at default precision for ~1–2k instances.
- NFR3: Guarantee WYSIWYG parity—export must visually match the on‑screen preview within the viewport.
- NFR4: Support latest desktop Chrome, Safari, Firefox, and Edge.
- NFR5: Sanitize uploaded SVGs to prevent script/filter injection or malicious content.
- NFR6: Avoid unnecessary transforms and precision bloat in exported SVG.
- NFR7: Operate fully client‑side with local storage for presets; no backend dependency for MVP.

## User Interface Design Goals

Note: Pre‑filled based on brief; assumptions marked “(assumed)”. Please confirm or adjust.

### Overall UX Vision
Provide an intuitive, responsive canvas with a fixed viewport overlay and control panels that enable rapid, precise experimentation. Ensure changes are immediately visible, and exporting is a one‑click, trustworthy action that matches the preview.

### Key Interaction Paradigms
- WYSIWYG viewport overlay atop SVG canvas.
- Parameter panels: Object, Distribution, Transform/Depth, Styling, Viewport, Export, Presets.
- Real‑time updates with responsive sliders/inputs; deterministic seeds for reproducibility.
- Clear validation for uploads and constraints; lightweight dialogs for presets/export.
 - Canvas view controls: pan/zoom the canvas; toggle viewport overlay; “Fit to Viewport”.

### Core Screens and Views
- Main Canvas & Controls
- Canvas View Controls (pan/zoom, overlay toggle, fit)
- Preset Manager (save/load)
- SVG Upload Dialog (normalization feedback)
- Export Modal (precision, viewport confirmation)
- Onboarding Tips/Help (lightweight)
- Settings (defaults, seed behavior)

### Accessibility: WCAG AA

### Branding
Minimal, neutral system UI for now. Provide brand tokens later if needed.

### Target Device and Platforms: Web app

## Technical Assumptions
- Frontend: Pure SVG rendering with modular JavaScript/TypeScript; no framework required for MVP (wrapper via Svelte/React possible later).
- Rendering: <defs>/<symbol>/<use> instance reuse; clipPath for viewport cropping; numeric precision control.
- State/Storage: Local storage for presets; deterministic RNG with seed.
- Backend: None for MVP; all client‑side.
- Hosting: Static (Vercel/Netlify/GitHub Pages).
- Security: Sanitize uploaded SVGs; restrict scope to simple group/path; strip scripts/filters.
 - Projection: Orthographic (MVP). No perspective/occlusion; view transforms are 2D only (pan/zoom).
 - World Space & Origin: World origin at (0,0) centered on canvas; units in CSS px; viewport overlay is anchored in world space.
 - View State (MVP): panX, panY, zoom, overlayVisible. View transforms do not alter export cropping or world coordinates.

### Depth Axis Behavior (MVP)
- Logical Depth: 0..1 parameter representing near→far placement along a conceptual Z.
- Visual Effect: Maps to per‑instance scale via scaleRange (e.g., 0.5→1.0).
- Render Order: sortByDepth ensures consistent visual layering.
- Z‑Position (Phase 2): True spatial Z with perspective/occlusion is deferred.
 

## Epics Overview
- Epic 1: Foundation & Core SVG Engine
- Epic 2: Distribution Modes & Controls
- Epic 3: Viewport & Export
- Epic 4: Presets, Seeds, and SVG Upload
- Epic 5: Performance and Validation

## Epic 1 Foundation & Core SVG Engine
Goal: Establish project scaffolding and implement the core SVG engine with basic shapes and spacing functions to enable initial pattern generation.

### Story 1.1 Project Bootstrap and Canary
As a developer, I want a minimal client app shell and build tooling, so that I can render a canary page and iterate quickly.

#### Acceptance Criteria
1: App builds and serves a simple canvas with placeholder UI panels.
2: Project includes linter/formatter and basic CI checks (build only).
3: Canary page renders an empty SVG scene without errors.

### Story 1.2 Basic Shapes via <defs>/<use>
As a user, I want to select a Square, Circle, or Triangle, so that I can begin generating patterns.

#### Acceptance Criteria
1: Shapes render via <defs>/<symbol>/<use> with correct geometry.
2: Switching shapes updates the scene without full re‑render jank.
3: Structure verified in DOM and export mock.

### Story 1.3 Spacing Functions and Linear Path Sampler
As a creator, I want linear path placement with spacing functions, so that I can control instance distribution.

#### Acceptance Criteria
1: Linear path sampler places N instances deterministically.
2: Spacing functions (linear/ease‑in/ease‑out) alter positions as expected.
3: No frame drops at ~1–2k instances on mid‑tier hardware.

## Epic 2 Distribution Modes & Controls
Goal: Add Sine path and Particle distributions with transform controls for depth and rotation.

### Story 2.1 Sine Path Sampler
As a user, I want a sine path distribution, so that I can create wavy patterns.

#### Acceptance Criteria
1: Sine sampler positions instances along a sine curve with adjustable frequency/amplitude.
2: Works with spacing functions consistently.
3: Deterministic placement given the same parameters.

### Story 2.2 Particle: Grid Jitter
As a user, I want a jittered grid distribution, so that I can create structured yet varied layouts.

#### Acceptance Criteria
1: Grid density and jitter controls update instance positions smoothly.
2: Maintains ~60 FPS up to ~5k instances in this mode.
3: Deterministic with a given seed.

### Story 2.3 Particle: Random Scatter
As a user, I want random scatter, so that I can create organic distributions.

#### Acceptance Criteria
1: Scatter respects density bounds and viewport/canvas constraints.
2: Deterministic with seed; updates smoothly on parameter changes.
3: No visual overlap artifacts beyond expected randomness.

### Story 2.4 Depth→Scale and Rotation Controls
As a user, I want depth mapped to scale and adjustable rotation, so that I can add depth and variation.

#### Acceptance Criteria
1: Depth parameter maps to scale with configurable range.
2: Rotation supports fixed value and randomized range (seeded).
3: Render order remains visually consistent relative to depth.

## Epic 3 Viewport & Export
Goal: Implement the fixed viewport overlay and produce clean, precise SVG exports that match the preview.

### Story 3.0 Canvas View Controls
As a user, I want to pan and zoom the canvas and toggle the viewport overlay, so that I can position patterns within the fixed viewport and preview unobstructed when needed.

#### Acceptance Criteria
1: Pan controls (click‑drag on canvas or X/Y inputs) offset the world‑space view.
2: Zoom control (wheel or slider) scales the view between 0.1× and 10×.
3: “Fit to Viewport” action centers and scales content to fill the frame.
4: Toggle viewport overlay visibility for unobstructed preview.
5: View transforms do not affect export; export remains anchored in world space under the overlay.

### Story 3.1 Viewport Overlay
As a user, I want to set aspect and orientation, so that I can compose within a fixed export frame.

#### Acceptance Criteria
1: Overlay supports 16:9, 1:1, 4:3 and landscape/portrait.
2: Canvas interaction respects overlay bounds.
3: Visual guides show cropping clearly.

### Story 3.2 SVG Export with clipPath and Precision
As a user, I want to export SVG that matches the preview, so that I can use it downstream without cleanup.

#### Acceptance Criteria
1: Export uses <defs>/<symbol>/<use> with clipPath cropping to viewport.
2: Precision control affects numeric output; default balances size/fidelity.
3: Typical scenes (~1–2k instances) export <150KB at default precision.

### Story 3.3 Parity Verification
As a user, I want assurance that export equals preview, so that I can trust outputs.

#### Acceptance Criteria
1: Visual diff checks show parity for representative scenes.
2: No layout differences due to unit/transform mismatches.
3: Known limitations documented within the Export UI.

## Epic 4 Presets, Seeds, and SVG Upload
Goal: Enable reproducibility and reuse via presets and seeds; allow simple SVG uploads with normalization.

### Story 4.1 Presets Save/Load
As a user, I want to save and load presets, so that I can reuse configurations.

#### Acceptance Criteria
1: Presets persist to local storage and survive refresh.
2: Loading a preset reproduces the scene exactly, including seed.
3: Basic preset management (rename/delete).

### Story 4.2 Seeded Randomness
As a creator, I want deterministic seeds, so that I can reproduce outputs.

#### Acceptance Criteria
1: Seed field drives all randomized parameters.
2: Same seed + params → identical layout across sessions.
3: Changing seed updates layout deterministically.

### Story 4.3 SVG Upload Normalization
As a user, I want to upload a simple SVG icon, so that I can use custom shapes.

#### Acceptance Criteria
1: Accepts single group/path SVGs; rejects complex files with clear reasons.
2: Normalization flattens transforms where feasible and strips scripts/filters.
3: Uploaded icon renders identically in preview and export.

## Epic 5 Performance and Validation
Goal: Meet performance targets and polish validations for a reliable MVP.

### Story 5.1 Performance Tuning
As a user, I want smooth interactions up to ~5k instances, so that the tool feels responsive.

#### Acceptance Criteria
1: Maintains ~60 FPS under typical interaction with 3–5k instances.
2: Uses rAF batching and style grouping where needed.
3: Preview density toggle available if instance counts exceed thresholds.

### Story 5.2 Validation and Error Messaging
As a user, I want clear feedback on invalid inputs and uploads, so that I can correct issues quickly.

#### Acceptance Criteria
1: Parameter inputs validate with inline messages and safe clamping.
2: Upload errors provide actionable instructions.
3: No unhandled exceptions in common flows.

 

## Stretch (Post‑MVP)

### Parameter Locking
- Purpose: Constrain parameter ranges/enums to maintain brand/style guardrails while enabling safe creativity.
- Model: A lock profile (JSON) overlays the scene schema and defines per‑parameter constraints: fixed values, allowed enums, min/max/step ranges, visibility (hide/readOnly), and seed control.
- UI Behavior: Locked controls are hidden or read‑only; numeric inputs clamp within bounds; disallowed enums show clear messages.
- Enforcement: Validate on change and on export; show lock indicators for transparency.
- Sharing: “Locked Preset” = starting values (preset) + lock profile. Embed in scene JSON or reference an external profile for reuse.

Example lock snippet
{
  "locks": {
    "distribution.mode": { "enum": ["path"] },
    "distribution.path": { "enum": ["linear", "sine"] },
    "transform.rotation": { "min": 0, "max": 15, "step": 5 },
    "style.fill": { "enum": ["#111111", "#FF5500", "#FFD200"] },
    "viewport.aspect": { "fixed": "1:1" },
    "export.precision": { "min": 2, "max": 3 }
  },
  "ui": { "hide": ["style.background"], "readOnly": ["viewport.orientation"] },
  "seed": { "fixed": 12345 }
}



### Analytics (Instrumentation)
- Post‑MVP event tracking for export, preset save/load, mode switches, instance counts, viewport selections, and seed changes.
- Opt‑out switch; no PII; focus on KPIs like activation and time‑to‑first‑export.

### Additional Stretch Items
- Path Multiplier: Generate N parallel paths with equal spacing; user controls pathCount (1..10) and pathSpacing (world units). Paths share frequency/spacing/depth settings.
- Additional path types (Bezier/parametric) with equal‑arc‑length spacing.
- Particle distributions: Poisson disk / blue‑noise; clusters and falloffs.
- Per‑instance color ramps, palettes, and style grouping.
- URL‑based scene sharing and governed profiles for team/brand use.
- Export optimization options (style grouping, quality slider).

## Phase 2: True 3D (Post-MVP)

### Camera & View Controls
- Perspective projection with FOV control
- Orbit controls (rotate 3D space around origin)
- Maintain fixed viewport overlay; rotate world underneath

### Spatial Depth
- Instances have true Z-coordinates in 3D space
- Depth control adjusts Z-spacing (near→far distance)
- Perspective scaling from camera (replaces depth→scale mapping)
- Optional occlusion/depth sorting

### Object Rotation
- Separate X/Y/Z rotation controls per instance
- Fixed values or seeded ranges for each axis
- Orientation follows path tangent (optional)

### Advanced Paths
- Quadratic/Cubic Bezier with control points
- Cosine, parametric curves
- Equal-arc-length sampling for uniform spacing
- Path multiplier (N parallel paths)

## Checklist Results Report
Pending. After your confirmation, we will run the PM checklist and populate results here.

## Next Steps

### UX Expert Prompt
Using this PRD, propose a high‑level layout and interaction model for the canvas, viewport overlay, and control panels. Highlight accessibility (WCAG AA), key flows (object selection, distribution tweaks, export), and suggestions to minimize cognitive load during exploration.

### Architect Prompt
Using this PRD, outline the client‑only architecture for a pure‑SVG renderer: module boundaries (engine, samplers, transforms, renderer, presets, export), state management approach, seeded RNG, and an MVP build pipeline. Call out performance strategies and upload sanitization.
