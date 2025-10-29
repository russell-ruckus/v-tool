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
  | { type: 'uploaded'; symbolId: string; viewBox: [number, number, number, number] };

/**
 * Instance position and transform
 */
export interface Instance {
  x: number;
  y: number;
  rotation: number; // degrees
  scale?: number; // optional, defaults to 1
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
export type PathType = 'linear' | 'sine';

/**
 * Path-based distribution
 */
export interface PathDistribution {
  mode: 'path';
  path: {
    type: PathType;
    instances: number;
    frequency?: number; // for sine (defer to future story)
    amplitude?: number; // for sine (defer to future story)
  };
  spacing: SpacingFn;
}

/**
 * Distribution type
 */
export type Distribution = PathDistribution;

/**
 * Transform configuration
 */
export interface Transform {
  rotation: { mode: 'fixed' | 'range'; value?: number; min?: number; max?: number };
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
