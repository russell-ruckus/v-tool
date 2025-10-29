# Stretch (Post‑MVP)

## Parameter Locking
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

## Analytics (Instrumentation)
- Post‑MVP event tracking for export, preset save/load, mode switches, instance counts, viewport selections, and seed changes.
- Opt‑out switch; no PII; focus on KPIs like activation and time‑to‑first‑export.

## Additional Stretch Items
- Path Multiplier: Generate N parallel paths with equal spacing; user controls pathCount (1..10) and pathSpacing (world units). Paths share frequency/spacing/depth settings.
- Additional path types (Bezier/parametric) with equal‑arc‑length spacing.
- Particle distributions: Poisson disk / blue‑noise; clusters and falloffs.
- Per‑instance color ramps, palettes, and style grouping.
- URL‑based scene sharing and governed profiles for team/brand use.
- Export optimization options (style grouping, quality slider).
