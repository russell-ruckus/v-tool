# Epic 3 Viewport & Export
Goal: Implement the fixed viewport overlay and produce clean, precise SVG exports that match the preview.

## Story 3.0 Canvas View Controls
As a user, I want to pan and zoom the canvas and toggle the viewport overlay, so that I can position patterns within the fixed viewport and preview unobstructed when needed.

### Acceptance Criteria
1: Pan controls (click‑drag on canvas or X/Y inputs) offset the world‑space view.
2: Zoom control (wheel or slider) scales the view between 0.1× and 10×.
3: “Fit to Viewport” action centers and scales content to fill the frame.
4: Toggle viewport overlay visibility for unobstructed preview.
5: View transforms do not affect export; export remains anchored in world space under the overlay.

## Story 3.1 Viewport Overlay
As a user, I want to set aspect and orientation, so that I can compose within a fixed export frame.

### Acceptance Criteria
1: Overlay supports 16:9, 1:1, 4:3 and landscape/portrait.
2: Canvas interaction respects overlay bounds.
3: Visual guides show cropping clearly.

## Story 3.2 SVG Export with clipPath and Precision
As a user, I want to export SVG that matches the preview, so that I can use it downstream without cleanup.

### Acceptance Criteria
1: Export uses <defs>/<symbol>/<use> with clipPath cropping to viewport.
2: Precision control affects numeric output; default balances size/fidelity.
3: Typical scenes (~1–2k instances) export <150KB at default precision.

## Story 3.3 Parity Verification
As a user, I want assurance that export equals preview, so that I can trust outputs.

### Acceptance Criteria
1: Visual diff checks show parity for representative scenes.
2: No layout differences due to unit/transform mismatches.
3: Known limitations documented within the Export UI.
