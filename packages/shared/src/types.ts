// Shared types for V-Tool

/**
 * Basic shape options
 */
export type BasicShape = 'square' | 'circle' | 'triangle';

/**
 * Shape source configuration
 * Can be a basic geometric shape or an uploaded SVG
 */
export type ShapeSource =
  | { type: 'basic'; shape: BasicShape }
  | {
      type: 'uploaded';
      symbolId: string;
      viewBox: [number, number, number, number];
      content?: string;
    };

/**
 * Instance position and transform
 */
export interface Instance {
  x: number;
  y: number;
  rotation: number; // degrees
  scale?: number; // optional, defaults to 1
  depth: number; // 0..1 for depth→scale mapping
}

/**
 * Random number generator state
 */
export interface RNG {
  seed: number;
}

/**
 * Spacing function types
 */
export type SpacingFn = 'linear' | 'ease-in' | 'ease-out';

/**
 * Path type for distribution
 */
export type PathType = 'linear' | 'sine' | 'bezier' | 'parametric' | 'spiral' | 'ellipse' | 'polygon' | 'arc';

/**
 * Path-based distribution
 */
export interface PathDistribution {
  mode: 'path';
  path: {
    type: PathType;
    instances: number;
    frequency?: number; // for sine, parametric, and spiral
    amplitude?: number; // for sine
    // Bezier control points (4 points for cubic bezier)
    ctrlPoints?: Array<{ x: number; y: number }>;
    // Parametric equations
    parametricX?: string; // e.g., "t * 600 - 300"
    parametricY?: string; // e.g., "Math.sin(t * 2 * Math.PI) * 50"
    // Spiral parameters
    spiralTurns?: number; // number of turns for spiral
    spiralRadius?: number; // max radius for spiral
    // Ellipse parameters
    ellipseRadiusX?: number; // horizontal radius
    ellipseRadiusY?: number; // vertical radius
    // Polygon parameters
    polygonSides?: number; // number of sides
    polygonRadius?: number; // radius of circumscribed circle
    // Arc parameters
    arcStartAngle?: number; // start angle in degrees
    arcEndAngle?: number; // end angle in degrees
    arcRadius?: number; // arc radius
  };
  spacing: SpacingFn;
}

/**
 * Grid jitter particle configuration
 */
export interface GridJitter {
  type: 'grid';
  density: number; // approx instances per 100x100 units
  jitter: number;  // 0..1
}

/**
 * Random scatter particle configuration (deferred to Story 2.3)
 */
export interface RandomScatter {
  type: 'random';
  density: number; // approx instances per 100x100 units
}

/**
 * Particle-based distribution
 */
export interface ParticleDistribution {
  mode: 'particle';
  particle: GridJitter | RandomScatter;
}

/**
 * Distribution type
 */
export type Distribution = PathDistribution | ParticleDistribution;

/**
 * Type guards for distribution discrimination
 */
export function isPathDistribution(d: Distribution): d is PathDistribution {
  return d.mode === 'path';
}

export function isParticleDistribution(d: Distribution): d is ParticleDistribution {
  return d.mode === 'particle';
}

export function isGridJitter(p: GridJitter | RandomScatter): p is GridJitter {
  return p.type === 'grid';
}

/**
 * Transform configuration
 */
export interface Transform {
  depthRange: [number, number]; // [0..1] input domain
  scaleRange: [number, number]; // output scale range
  rotation: { 
    mode: 'fixed' | 'range'; 
    value?: number;       // for fixed mode
    min?: number;        // for range mode
    max?: number;        // for range mode
  };
  sortByDepth: boolean;
}

/**
 * Styling configuration
 */
export interface Styling {
  fill: string;
  stroke: string;
  strokeWidth: number;
  background: string;
}

/**
 * View configuration
 */
export interface View {
  pan: { x: number; y: number };
  zoom: number; // 0.1 to 10
  overlayVisible: boolean;
}

/**
 * Aspect ratio for viewport
 */
export type AspectRatio = '16:9' | '1:1' | '4:3';

/**
 * Orientation for viewport
 */
export type Orientation = 'landscape' | 'portrait';

/**
 * Viewport configuration
 */
export interface Viewport {
  aspect: AspectRatio;
  orientation: Orientation;
  width: number; // px
}

/**
 * Export settings
 */
export interface ExportSettings {
  precision: number;
  useSymbols: true;
  clipToViewport: true;
}

/**
 * Complete scene state
 */
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
}
