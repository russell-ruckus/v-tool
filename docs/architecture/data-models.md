# Data Models

The following conceptual models define the scene, distribution, transforms, styling, viewport, and export concerns. These live in `packages/shared` so both UI and engine can share the types.

## Scene
Purpose: Canonical container for all parameters defining a renderable scene and its export characteristics.

Key Attributes
- id: string — unique scene identifier
- version: string — schema version for migrations
- rng: RNG — deterministic seed source
- shape: ShapeSource — basic or uploaded symbol
- distribution: Distribution — path or particle with subtype
- transform: Transform — depth→scale mapping and rotation settings
- style: Styling — fill/stroke/background
 - view: View — pan/zoom and overlay visibility
- viewport: Viewport — aspect/orientation and base width
- export: ExportSettings — numeric precision and clipping

TypeScript Interface
```ts
export interface Scene {
  id: string;
  version: string;
  rng: RNG;
  shape: ShapeSource;
  distribution: Distribution;
  transform: Transform;
  style: Styling;
  view: View;
  viewport: Viewport;
  export: ExportSettings;
  // lockProfileId?: string; // stretch: parameter locking profile reference
}
```

Relationships
- Aggregates ShapeSource, Distribution, Transform, Styling, Viewport, ExportSettings, and RNG.
- Is embedded inside Preset.

## RNG
Purpose: Deterministic seed management for all randomized parameters.

Key Attributes
- seed: number — master seed controlling samplers and randomization

TypeScript Interface
```ts
export interface RNG {
  seed: number;
}
```

Relationships
- Referenced by Scene; drives randomized placement and rotations.

## ShapeSource
Purpose: Defines the instance geometry source (basic shape or uploaded, normalized SVG symbol).

Key Attributes
- type: 'basic' | 'uploaded'
- shape (when basic): 'square' | 'circle' | 'triangle'
- symbolId (when uploaded): string — id within <defs>
- viewBox (when uploaded): [number, number, number, number]

TypeScript Interface
```ts
export type BasicShape = 'square' | 'circle' | 'triangle';

export type ShapeSource =
  | { type: 'basic'; shape: BasicShape }
  | { type: 'uploaded'; symbolId: string; viewBox: [number, number, number, number] };
```

Relationships
- For uploaded shapes, the symbol is produced by the sanitization/normalization pipeline.

## Distribution
Purpose: Controls instance placement via Path or Particle modes.

Key Attributes
- mode: 'path' | 'particle'
- spacing: 'linear' | 'ease-in' | 'ease-out' (for path)
- Path subtype: 'linear' | 'sine' with frequency/amplitude and instances
- Particle subtype: 'grid' with jitter or 'random' with density

TypeScript Interface
```ts
export type SpacingFn = 'linear' | 'ease-in' | 'ease-out';
export type PathType = 'linear' | 'sine';

export interface PathDistribution {
  mode: 'path';
  path: {
    type: PathType;
    instances: number;     // total instances to place
    frequency?: number;    // for sine
    amplitude?: number;    // for sine
  };
  spacing: SpacingFn;
}

export interface GridJitter {
  type: 'grid';
  density: number; // approx instances per 100x100 units
  jitter: number;  // 0..1
}

export interface RandomScatter {
  type: 'random';
  density: number; // approx instances per 100x100 units
}

export interface ParticleDistribution {
  mode: 'particle';
  particle: GridJitter | RandomScatter;
}

export type Distribution = PathDistribution | ParticleDistribution;
```

Relationships
- Scene selects one Distribution; PathDistribution references a SpacingFn.

## Transform
Purpose: Maps conceptual depth to per-instance scale and handles rotation behavior; controls render order.

Key Attributes
- depthRange: [number, number] — 0..1 logical depth input domain
- scaleRange: [number, number] — output scale range applied by depth
- rotation: fixed or range (min,max); seeded if randomized
- sortByDepth: boolean — ensure visual consistency per PRD

TypeScript Interface
```ts
export interface Transform {
  depthRange: [number, number];
  scaleRange: [number, number];
  rotation: { mode: 'fixed' | 'range'; value?: number; min?: number; max?: number };
  sortByDepth: boolean;
}
```

Relationships
- Applied by the engine during placement and render ordering.

## Projection & Depth Semantics (MVP)
Purpose: Clarify how depth is represented visually without full 3D.

Key Points
- Projection: Orthographic; no camera perspective or occlusion in MVP.
- Depth: Logical depth 0..1 maps to per-instance scale via scaleRange.
- Ordering: sortByDepth enforces visual layering to imply depth.
- Future: True Z positioning with camera transforms is deferred to Phase 2.

## World Space & Origin
Purpose: Define coordinate system and view transforms.

Key Points
- Origin: World origin at (0,0) centered on canvas.
- Units: CSS pixels for simplicity and parity with SVG.
- View Transform: Pan (x,y) and zoom apply as a 2D transform of the world into the viewport; does not alter export cropping.

## Styling
Purpose: Scene-level styling for fill/stroke/background.

Key Attributes
- fill: string (CSS color)
- stroke: string (CSS color)
- strokeWidth: number (px)
- background: string (CSS color)

TypeScript Interface
```ts
export interface Styling {
  fill: string;
  stroke: string;
  strokeWidth: number;
  background: string;
}
```

Relationships
- Consumed by renderer and export pipeline; can be grouped later for optimization (stretch).

## Viewport
Purpose: Fixed export frame with aspect and orientation.

Key Attributes
- aspect: '16:9' | '1:1' | '4:3'
- orientation: 'landscape' | 'portrait'
- width: number (px) — height derived from aspect

TypeScript Interface
```ts
export type AspectRatio = '16:9' | '1:1' | '4:3';
export type Orientation = 'landscape' | 'portrait';

export interface Viewport {
  aspect: AspectRatio;
  orientation: Orientation;
  width: number; // px; height derived from aspect
}
```

Relationships
- Used by renderer overlay and export cropping.

## View (MVP)
Purpose: Canvas view state for 2D navigation and overlay visibility.

Key Attributes
- pan: { x: number, y: number } — world-space offset
- zoom: number — 0.1..10 scale factor
- overlayVisible: boolean — show/hide viewport guides

TypeScript Interface
```ts
export interface View {
  pan: { x: number; y: number };
  zoom: number; // 0.1..10
  overlayVisible: boolean;
}
```

Relationships
- Referenced by Scene; consumed by renderer and UI Canvas Controls.

## ExportSettings
Purpose: Controls precision and cropping to guarantee parity and small output.

Key Attributes
- precision: number — decimal precision for numeric outputs
- useSymbols: true — enforce <defs>/<symbol>/<use>
- clipToViewport: true — apply clipPath to exact viewport bounds

TypeScript Interface
```ts
export interface ExportSettings {
  precision: number;
  useSymbols: true;
  clipToViewport: true;
}
```

Relationships
- Referenced by Scene; used by exporter.

## Preset
Purpose: Persist and reuse complete scenes via local storage.

Key Attributes
- id: string, name: string
- scene: Scene — full scene snapshot (including seed)
- createdAt/updatedAt: ISO strings

TypeScript Interface
```ts
export interface Preset {
  id: string;
  name: string;
  scene: Scene;
  createdAt: string;
  updatedAt?: string;
}
```

Relationships
- Stored/retrieved locally; loading a preset reproduces the scene exactly.

## UploadNormalizationResult (runtime)
Purpose: Reports outcome of SVG sanitization/normalization on upload.

Key Attributes
- ok: boolean, reason?: string
- symbolId?: string, viewBox?: [number, number, number, number]
- stripped: { scripts: boolean; filters: boolean; transformsFlattened: boolean }

TypeScript Interface
```ts
export interface UploadNormalizationResult {
  ok: boolean;
  reason?: string;
  symbolId?: string;
  viewBox?: [number, number, number, number];
  stripped: {
    scripts: boolean;
    filters: boolean;
    transformsFlattened: boolean;
  };
}
```

Relationships
- When ok=true, produces the data to construct a ShapeSource of type 'uploaded'.
