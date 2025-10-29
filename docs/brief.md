# Project Brief: V-Tool

## Executive Summary
V-Tool is a visual pattern generator that repeats basic or uploaded vector shapes across 3D-configurable space, exporting clean, production-ready SVG inside a fixed, user-controlled viewport. It provides intuitive control over distribution via paths or particles, depth-based scaling, spacing functions, rotation, and color. The MVP focuses on a pure-SVG engine for true WYSIWYG preview-export parity and fast iteration.

- Problem: Designers and creative coders spend excessive time crafting complex, precise vector patterns and exports; current tools either lack procedural control or introduce raster/pipeline mismatches.
- Target Market: Designers, illustrators, creative coders, brand/marketing teams needing consistent, parameterized pattern generation.
- Value Proposition: Fast, precise, repeatable pattern creation with parameter locking for shareable constrained generators, high-fidelity SVG export, and lightweight performance.

## Problem Statement
Designers need repeatable, parameterized pattern creation that remains fully vector and export-accurate. Traditional vector tools are manual and slow for procedural exploration. Generative tools often preview in a different engine than export, creating mismatches. Brand teams also need a way to constrain parameters to maintain identity while enabling creation. The absence of a streamlined, WYSIWYG, vector-first generator leads to lost time, inconsistent outputs, and limited exploration.

## Proposed Solution
A pure-SVG-based pattern engine with an interactive canvas beneath a fixed export viewport. Users choose an object (basic shape or uploaded SVG), then distribute instances along a selected method (Path or Particle). Path types include linear and sine for MVP (extensible later). Users control frequency, spacing, depth along z (mapped to scale and sort), depth scaling, per-instance rotation, fills/strokes, background, and seed. The viewport remains fixed with adjustable aspect/orientation, and export crops to it using SVG clip paths. Parameter-locking enables shareable “mini tools” with curated controls.

- Core differentiators: WYSIWYG preview/export parity, vector-first pipeline, parameter-locking for brand-safe generation, deterministic seeds, fast iteration with <symbol>/<use>.
- Why it will succeed: Focused scope, pragmatic math, and immediate designer value; extensible without adopting heavyweight 3D engines.

## Target Users
### Primary User Segment: Designers & Illustrators
- Profile: Professional/independent designers producing vector assets for web, print, branding.
- Behaviors: Iterative exploration, export to SVG for downstream editing, precision requirements.
- Needs: Rapid procedural variation, precise constraints, clean SVG output, parameter presets.
- Goals: Create unique, scalable patterns quickly with minimal cleanup.

### Secondary User Segment: Creative Coders & Brand Teams
- Profile: Creative developers prototyping visuals; brand teams creating on-brand patterns.
- Needs: Deterministic seeds, param schemas, shareable presets; parameter locking for governance.
- Goals: Explore programmatic variants and distribute “safe-to-use” pattern generators to stakeholders.

## Goals & Success Metrics
### Business Objectives
- Increase designer productivity in vector pattern creation by 3–5×.
- Establish parameter-locked sharing to drive B2B/team adoption.
- Ship a usable MVP within 6–8 weeks, gather early design partner feedback.

### User Success Metrics
- Time-to-first-export under 2 minutes for new users.
- >80% of exports require zero manual cleanup in external tools.
- Users save/load presets and reuse at least 3 times/session.

### Key Performance Indicators (KPIs)
- Activation: % of users completing an export on first session.
- Retention: Weekly returning users and preset re-use rate.
- Output Quality: % exports with < 150KB size at default precision.
- Performance: 60 FPS interaction up to 5k instances on mid-tier hardware.

## MVP Scope
### Core Features (Must Have)
- Object: Square, Circle, Triangle; single uploaded SVG (single group/path normalized).
- Distribution: Path (Linear + Sine) and Particle (grid jitter + random scatter).
- Controls: Frequency, spacing (linear, ease-in/out), depth, depth scale, per-instance rotation.
- Styling: Fill, stroke, background color.
- Viewport: Fixed overlay; orientation (landscape/portrait) and aspect (16:9, 1:1, 4:3).
- Export: SVG with <defs>/<symbol>/<use>, clipPath to viewport, precision control.
- Presets: Save/load; seeded randomness for reproducibility.

### Out of Scope for MVP
- Perspective/true 3D occlusion.
- Complex uploaded SVGs (multi-nested transforms, filters).
- Advanced path types (Bezier, parametric), Poisson disk sampling.
- Multi-shape sequences, animations, and video export.

### MVP Success Criteria
A user can select or upload a shape, configure distribution in either Path or Particle mode, adjust depth/scale/spacing/rotation/color, set viewport, and export a clean SVG that matches the on-screen preview. Exports are small, precise, and immediately usable downstream without cleanup.

## Post-MVP Vision
### Phase 2 Features
- Additional path types: quadratic/cubic Bezier, parametric; equal-arc-length spacing.
- Particle: Poisson disk and blue-noise sampling; clusters and falloffs.
- Per-instance color ramps, palettes, and style grouping.
- URL-based scene sharing and locked-parameter profiles.

### Long-term Vision
- Optional perspective camera and occlusion; hybrid WebGL preview for heavy scenes.
- Multi-shape sequences, grid/polar arrays, staged compositions.
- Timeline-based motion; animated SVG/image-sequence export.

### Expansion Opportunities
- Team/brand workspaces with governed parameter profiles.
- Plugin ecosystem for custom paths, spacing, distributions, and color systems.
- Marketplace for sharing/selling parameter-locked generators.

## Technical Considerations
### Platform Requirements
- Target Platforms: Modern desktop browsers.
- Browser/OS Support: Latest Chrome, Safari, Firefox, Edge.
- Performance Requirements: 60 FPS up to ~5k instances; memory-conscious DOM updates.

### Technology Preferences
- Frontend: Pure SVG rendering with modular JS; optional Svelte/React wrapper later.
- Backend: None required for MVP; local storage for presets.
- Database: N/A for MVP.
- Hosting/Infrastructure: Static hosting (Vercel/Netlify/GitHub Pages).

### Architecture Considerations
- Repository Structure: Core engine (math/transforms), renderer (SVG), UI (controls/panels), export (SVG generator), presets.
- Service Architecture: Client-only; future optional share/presets sync service.
- Integration Requirements: SVG import normalization; color palette import/export.
- Security/Compliance: Sanitize uploaded SVG; prevent script/filter injection.

## Constraints & Assumptions
### Constraints
- Budget: Small founder-led effort; prioritize rapid MVP.
- Timeline: 6–8 weeks to MVP, 2–3 weeks to first iteration.
- Resources: Solo dev/design; engage 2–3 design partners for feedback.
- Technical: Pure SVG pipeline for MVP; orthographic projection only.

### Key Assumptions
- Designers value WYSIWYG vector fidelity and parameter locking.
- Performance is acceptable with <symbol>/<use> and grouped transforms.
- Seeded RNG and presets are essential for reuse and collaboration.

## Risks & Open Questions
### Key Risks
- Performance degradation beyond ~10–20k instances; mitigations: preview density toggle, rAF throttling, style batching.
- Uploaded SVG complexity (nested transforms, filters) causing bloated output; mitigation: normalize/flatten on import and restrict scope.
- 3D expectations vs orthographic MVP; mitigation: clear UI, roadmap for perspective.

### Open Questions
- Depth mapping: scale-only vs optional opacity/shading?
- Param-lock sharing: embed schema in scene JSON vs separate profile file?
- Export optimization: group-by-style and precision defaults; per-export “quality” slider?

### Areas Needing Further Research
- Equal-arc-length sampling for curves and impact on spacing functions.
- Optimal precision trade-offs for size vs fidelity in SVG.
- Color systems and palette interoperability (ASE, GPL, etc.).

## Appendices
### A. Research Summary
- Based on initial brainstorming: Pure SVG MVP, path/particle distributions, fixed viewport export, parameter locking, and extensibility roadmap.

### B. Stakeholder Input
- To be gathered from early design partners.

### C. References
- N/A (to be populated as research proceeds)

## Next Steps
### Immediate Actions
1. Draft UI wireframes (controls layout, viewport/canvas behavior).
2. Define JSON scene + param schema (including locking metadata).
3. Implement core engine: spacing functions, path sampler, depth/scale mapping.
4. Build SVG renderer with <defs>/<symbol>/<use> and clipPath export.
5. Add presets save/load and seeded randomness; basic import for single-path SVG.
6. Dogfood with 2–3 design partners; collect feedback and iterate.

### PM Handoff
This Project Brief provides the full context for V-Tool. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.

