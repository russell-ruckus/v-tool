import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Canvas } from '../src/components/canvas/Canvas';
import { init, getState, getView, updateView } from '../src/store/store';
import { createTestScene } from './testHelpers';
import { clampViewToOverlay, computeFitView } from '../src/utils/view';
import { exportSVG } from '../src/services/export';

function flushRAF(): Promise<void> {
  if (typeof requestAnimationFrame === 'undefined') {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

describe('View Controls', () => {
  let root: HTMLElement;
  let cleanup: () => void;
  let svg: SVGSVGElement;

  beforeEach(() => {
    root = document.createElement('div');
    init(createTestScene());
    cleanup = Canvas(root);
    svg = root.querySelector('svg') as SVGSVGElement;
  });

  afterEach(() => {
    cleanup();
  });

  it('applies pan to world transform', () => {
    updateView({ pan: { x: 40, y: -20 } });
    const world = svg.querySelector('#world');
    expect(world?.getAttribute('transform')).toBe('translate(400 300) scale(1 1) translate(40 -20)');
  });

  it('applies zoom via wheel interaction', async () => {
    const initialZoom = getView().zoom;
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -5000,
      clientX: 400,
      clientY: 300,
      bubbles: true,
      cancelable: true,
    });
    svg.dispatchEvent(wheelEvent);
    await flushRAF();
    // Zoom should increase (deltaY negative = zoom in)
    // Should be clamped to max 10 but not clamped to overlay bounds
    expect(getView().zoom).toBeGreaterThan(initialZoom);
    expect(getView().zoom).toBeLessThanOrEqual(10);
  });

  it('toggles overlay visibility', () => {
    const overlay = () => svg.querySelector('#viewport-overlay') as SVGRectElement | null;
    expect(overlay()?.style.display).toBe('block');
    updateView({ overlayVisible: false });
    expect(overlay()?.style.display).toBe('none');
  });

  it('fits content to viewport bounds', () => {
    const scene = createTestScene({
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 1 },
        spacing: 'linear',
      },
    });
    const fit = computeFitView(scene);
    expect(fit).not.toBeNull();
    expect(fit?.zoom).toBeCloseTo(9, 5);
    expect(fit?.pan.x).toBeCloseTo(-25, 5);
    expect(fit?.pan.y).toBeCloseTo(-25, 5);
  });

  it('keeps export output independent of view transforms', async () => {
    const scene = getState();
    const baseline = exportSVG(svg, scene);
    updateView({ pan: { x: 120, y: -60 }, zoom: 2 });
    await flushRAF();
    const updatedScene = getState();
    const after = exportSVG(svg, updatedScene);
    expect(after).toBe(baseline);
  });
});

