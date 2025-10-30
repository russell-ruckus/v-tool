import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Canvas } from '../src/components/canvas/Canvas';
import { init, getState, updateViewport, updateView } from '../src/store/store';
import { createTestScene } from './testHelpers';
import { clampViewToOverlay, computeInstanceBounds, computeViewportSize } from '../src/utils/view';

describe('Viewport Overlay', () => {
  let root: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    root = document.createElement('div');
    init(createTestScene());
    cleanup = Canvas(root);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders overlay dimensions based on aspect and orientation', () => {
    const overlay = () => root.querySelector('#viewport-overlay') as SVGRectElement | null;
    const initialDims = computeViewportSize(getState());
    expect(Number(overlay()?.getAttribute('width'))).toBeCloseTo(initialDims.width, 5);
    expect(Number(overlay()?.getAttribute('height'))).toBeCloseTo(initialDims.height, 5);

    updateViewport({ aspect: '1:1' });
    let dims = computeViewportSize(getState());
    expect(Number(overlay()?.getAttribute('width'))).toBeCloseTo(dims.width, 5);
    expect(Number(overlay()?.getAttribute('height'))).toBeCloseTo(dims.height, 5);

    updateViewport({ orientation: 'portrait', width: 600 });
    dims = computeViewportSize(getState());
    expect(Number(overlay()?.getAttribute('width'))).toBeCloseTo(dims.width, 5);
    expect(Number(overlay()?.getAttribute('height'))).toBeCloseTo(dims.height, 5);
  });

  it('toggles overlay guides and shade visibility', () => {
    const elements = () => [
      '#viewport-overlay-shade',
      '#viewport-overlay',
      '#viewport-overlay-guide-horizontal',
      '#viewport-overlay-guide-vertical',
    ].map((selector) => root.querySelector(selector) as SVGElement | null);

    elements().forEach((el) => expect(el?.style.display).toBe('block'));

    updateView({ overlayVisible: false });
    elements().forEach((el) => expect(el?.style.display).toBe('none'));
  });

  it('clamps pan and zoom when overlay is active', () => {
    const scene = getState();
    const bounds = computeInstanceBounds(scene);
    expect(bounds).not.toBeNull();

    const clamped = clampViewToOverlay(scene, { x: 500, y: -500 }, 8);
    const dims = computeViewportSize(scene);
    const halfW = dims.width / 2;
    const halfH = dims.height / 2;

    const minPanX = (-halfW / clamped.zoom) - (bounds?.minX ?? 0);
    const maxPanX = (halfW / clamped.zoom) - (bounds?.maxX ?? 0);
    const minPanY = (-halfH / clamped.zoom) - (bounds?.minY ?? 0);
    const maxPanY = (halfH / clamped.zoom) - (bounds?.maxY ?? 0);

    expect(clamped.pan.x).toBeGreaterThanOrEqual(minPanX - 1e-3);
    expect(clamped.pan.x).toBeLessThanOrEqual(maxPanX + 1e-3);
    expect(clamped.pan.y).toBeGreaterThanOrEqual(minPanY - 1e-3);
    expect(clamped.pan.y).toBeLessThanOrEqual(maxPanY + 1e-3);
  });
});

