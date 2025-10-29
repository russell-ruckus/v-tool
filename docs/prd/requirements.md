# Requirements

## Functional (FR)
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

## Non Functional (NFR)
- NFR1: Maintain ~60 FPS interaction up to ~5k instances on mid‑tier desktop hardware.
- NFR2: Ensure exported SVGs typically remain under ~150KB at default precision for ~1–2k instances.
- NFR3: Guarantee WYSIWYG parity—export must visually match the on‑screen preview within the viewport.
- NFR4: Support latest desktop Chrome, Safari, Firefox, and Edge.
- NFR5: Sanitize uploaded SVGs to prevent script/filter injection or malicious content.
- NFR6: Avoid unnecessary transforms and precision bloat in exported SVG.
- NFR7: Operate fully client‑side with local storage for presets; no backend dependency for MVP.
