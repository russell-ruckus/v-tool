# Goals and Background Context

## Goals
- Deliver a pure‑SVG pattern generator with WYSIWYG preview/export parity.
- Enable rapid procedural exploration with precise controls and clean SVG output.
- Support basic shapes and simple SVG uploads with deterministic seeds and presets.
- Achieve 60 FPS interaction up to ~5k instances on desktop browsers.
- Ship MVP within 6–8 weeks and validate with design partners.

## Background Context
Designers and creative coders spend significant time crafting precise vector patterns. Traditional vector tools are manual and slow for procedural exploration, while many generative tools preview in a different engine than export, leading to mismatches. V‑Tool focuses on a vector‑first, pure‑SVG pipeline to ensure preview/export parity, fast iteration, and clean, production‑ready exports—supporting brand‑safe reuse via presets and seeds.

The MVP targets core distribution methods (Path: Linear/Sine; Particle: grid jitter/random), essential transforms (depth→scale, rotation), styling, a fixed export viewport, and deterministic presets to maximize immediate value while keeping scope tight.

## Change Log
| Date       | Version | Description                    | Author |
|------------|---------|--------------------------------|--------|
| 2025-10-29 | v0.3    | Target set to Web app; moved analytics to Stretch; added parameter locking to Stretch | Codex  |
| 2025-10-29 | v0.2    | Template-aligned restructure   | Codex  |
| 2025-10-29 | v0.1    | Initial PRD draft from brief   | Codex  |
