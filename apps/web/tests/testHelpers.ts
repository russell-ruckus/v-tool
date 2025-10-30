/**
 * Test helper utilities
 */
import type { Scene } from '@v-tool/shared';

/**
 * Create a minimal complete Scene for testing
 */
export function createTestScene(overrides?: Partial<Scene>): Scene {
  return {
    id: '1',
    version: '1.0',
    rng: { seed: 12345 },
    shape: { type: 'basic', shape: 'square' },
    distribution: {
      mode: 'path',
      path: { type: 'linear', instances: 10 },
      spacing: 'linear',
    },
    transform: {
      depthRange: [0, 1],
      scaleRange: [0.5, 1.5],
      rotation: { mode: 'fixed', value: 0 },
      sortByDepth: false,
    },
    style: {
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 1,
      background: '#ffffff',
    },
    view: {
      pan: { x: 0, y: 0 },
      zoom: 1,
      overlayVisible: true,
    },
    viewport: {
      aspect: '16:9',
      orientation: 'landscape',
      width: 800,
    },
    export: {
      precision: 2,
      useSymbols: true,
      clipToViewport: true,
    },
    ...overrides,
  };
}

