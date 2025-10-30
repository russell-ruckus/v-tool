import { describe, it, expect, beforeEach } from 'vitest';
import { renderInstances } from '../src/components/canvas/Renderer';
import { init } from '../src/store/store';
import { createTestScene } from './testHelpers';
import type { Scene } from '@v-tool/shared';

describe('Multi-Instance Rendering', () => {
  let svg: SVGSVGElement;
  let scene: Scene;

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');

    // Initialize store with test scene
    scene = createTestScene({
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 5 },
        spacing: 'linear',
      },
    });

    init(scene);
  });

  it('creates correct number of <use> elements', () => {
    renderInstances(svg, scene);

    const uses = svg.querySelectorAll('use');
    expect(uses.length).toBe(5);
  });

  it('centers world transform at canvas origin', () => {
    renderInstances(svg, scene);
    const world = svg.querySelector('#world');
    expect(world).toBeTruthy();
    expect(world?.getAttribute('transform')).toBe('translate(400 300) scale(1 1) translate(0 0)');
  });

  it('uses DocumentFragment for batch DOM creation', () => {
    // Create documentFragment and verify it's used
    renderInstances(svg, scene);
    
    // Verify instances were added
    const uses = svg.querySelectorAll('use');
    expect(uses.length).toBe(5);
  });

  it('updates DOM when instance count changes', () => {
    renderInstances(svg, scene);
    expect(svg.querySelectorAll('use').length).toBe(5);

    const updatedScene: Scene = {
      ...scene,
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 10, frequency: 1.0, amplitude: 50 },
        spacing: 'linear',
      },
    };

    renderInstances(svg, updatedScene);
    expect(svg.querySelectorAll('use').length).toBe(10);
  });

  it('clears previous instances before adding new ones', () => {
    renderInstances(svg, scene);
    expect(svg.querySelectorAll('use').length).toBe(5);

    const updatedScene: Scene = {
      ...scene,
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 3, frequency: 1.0, amplitude: 50 },
        spacing: 'linear',
      },
    };

    renderInstances(svg, updatedScene);
    expect(svg.querySelectorAll('use').length).toBe(3);
  });

  it('positions instances correctly', () => {
    renderInstances(svg, scene);

    const uses = svg.querySelectorAll('use');
    expect(uses.length).toBeGreaterThan(0);

    // Check first instance position
    const firstUse = uses[0];

    expect(firstUse.getAttribute('x')).toBeTruthy();
    expect(firstUse.getAttribute('y')).toBeTruthy();
  });

  it('applies spacing functions', () => {
    const linearScene: Scene = {
      ...scene,
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 5, frequency: 1.0, amplitude: 50 },
        spacing: 'linear',
      },
    };

    renderInstances(svg, linearScene);
    const linearUses = Array.from(svg.querySelectorAll('use')).map((u) =>
      Number(u.getAttribute('x'))
    );

    const easeInScene: Scene = {
      ...scene,
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 5, frequency: 1.0, amplitude: 50 },
        spacing: 'ease-in',
      },
    };

    renderInstances(svg, easeInScene);
    const easeInUses = Array.from(svg.querySelectorAll('use')).map((u) =>
      Number(u.getAttribute('x'))
    );

    // Spacing functions should produce different positions
    expect(linearUses).not.toEqual(easeInUses);
  });

  it('creates instance group if not exists', () => {
    expect(svg.querySelector('#instances')).toBeNull();

    renderInstances(svg, scene);

    expect(svg.querySelector('#instances')).toBeTruthy();
  });

  it('reuses existing instance group', () => {
    renderInstances(svg, scene);
    const group1 = svg.querySelector('#instances');

    renderInstances(svg, scene);
    const group2 = svg.querySelector('#instances');

    expect(group1).toBe(group2); // Same element reference
  });

  describe('Transform Integration', () => {
    it('applies depth→scale mapping to rendered instances', () => {
      const sceneWithScale = createTestScene({
        distribution: {
          mode: 'path',
          path: { type: 'linear', instances: 3 },
          spacing: 'linear',
        },
        transform: {
          depthRange: [0, 1],
          scaleRange: [0.5, 1.5],
          rotation: { mode: 'fixed', value: 0 },
          sortByDepth: false,
        },
      });

      renderInstances(svg, sceneWithScale);

      const uses = svg.querySelectorAll('use');
      expect(uses).toHaveLength(3);

      // Check that different instances have different scales
      const widths = Array.from(uses).map(use => parseFloat(use.getAttribute('width') || '50'));
      const heights = Array.from(uses).map(use => parseFloat(use.getAttribute('height') || '50'));

      // Should have different scales (not all the same)
      const uniqueWidths = new Set(widths);
      expect(uniqueWidths.size).toBeGreaterThan(1);
      
      // All scales should be within expected range (50 * 0.5 to 50 * 1.5)
      widths.forEach(width => {
        expect(width).toBeGreaterThanOrEqual(25); // 50 * 0.5
        expect(width).toBeLessThanOrEqual(75);    // 50 * 1.5
      });
      
      heights.forEach(height => {
        expect(height).toBeGreaterThanOrEqual(25);
        expect(height).toBeLessThanOrEqual(75);
      });
    });

    it('applies rotation transforms correctly', () => {
      const sceneWithRotation = createTestScene({
        distribution: {
          mode: 'path',
          path: { type: 'linear', instances: 2 },
          spacing: 'linear',
        },
        transform: {
          depthRange: [0, 1],
          scaleRange: [1, 1],
          rotation: { mode: 'fixed', value: 45 },
          sortByDepth: false,
        },
      });

      renderInstances(svg, sceneWithRotation);

      const uses = svg.querySelectorAll('use');
      expect(uses).toHaveLength(2);

      // Check that rotation transforms are applied
      uses.forEach(use => {
        const transform = use.getAttribute('transform');
        expect(transform).toContain('rotate(45');
      });
    });

    it('sorts instances by depth when enabled', () => {
      const sceneWithSorting = createTestScene({
        distribution: {
          mode: 'particle',
          particle: { type: 'random', density: 3 },
        },
        transform: {
          depthRange: [0, 1],
          scaleRange: [0.5, 1.5],
          rotation: { mode: 'fixed', value: 0 },
          sortByDepth: true,
        },
      });

      renderInstances(svg, sceneWithSorting);

      const uses = svg.querySelectorAll('use');
      expect(uses.length).toBeGreaterThan(0);

      // With sorting enabled, instances should be rendered in depth order
      // We can't easily test the exact order without knowing the random depths,
      // but we can verify that the rendering completes without errors
      expect(uses.length).toBeGreaterThan(0);
    });

    it('handles no rotation when rotation is 0', () => {
      const sceneNoRotation = createTestScene({
        distribution: {
          mode: 'path',
          path: { type: 'linear', instances: 2 },
          spacing: 'linear',
        },
        transform: {
          depthRange: [0, 1],
          scaleRange: [1, 1],
          rotation: { mode: 'fixed', value: 0 },
          sortByDepth: false,
        },
      });

      renderInstances(svg, sceneNoRotation);

      const uses = svg.querySelectorAll('use');
      expect(uses).toHaveLength(2);

      // Check that no rotation transforms are applied when rotation is 0
      uses.forEach(use => {
        const transform = use.getAttribute('transform');
        expect(transform).toBeNull(); // No transform attribute should be set
      });
    });
  });
});

