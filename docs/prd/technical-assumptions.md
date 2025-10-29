# Technical Assumptions
- Frontend: Pure SVG rendering with modular JavaScript/TypeScript; no framework required for MVP (wrapper via Svelte/React possible later).
- Rendering: <defs>/<symbol>/<use> instance reuse; clipPath for viewport cropping; numeric precision control.
- State/Storage: Local storage for presets; deterministic RNG with seed.
- Backend: None for MVP; all client‑side.
- Hosting: Static (Vercel/Netlify/GitHub Pages).
- Security: Sanitize uploaded SVGs; restrict scope to simple group/path; strip scripts/filters.
 - Projection: Orthographic (MVP). No perspective/occlusion; view transforms are 2D only (pan/zoom).
 - World Space & Origin: World origin at (0,0) centered on canvas; units in CSS px; viewport overlay is anchored in world space.
 - View State (MVP): panX, panY, zoom, overlayVisible. View transforms do not alter export cropping or world coordinates.

## Depth Axis Behavior (MVP)
- Logical Depth: 0..1 parameter representing near→far placement along a conceptual Z.
- Visual Effect: Maps to per‑instance scale via scaleRange (e.g., 0.5→1.0).
- Render Order: sortByDepth ensures consistent visual layering.
- Z‑Position (Phase 2): True spatial Z with perspective/occlusion is deferred.
 
