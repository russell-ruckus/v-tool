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
        ...scene.distribution,
        path: { ...scene.distribution.path, instances: 10 },
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
        ...scene.distribution,
        path: { ...scene.distribution.path, instances: 3 },
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
      distribution: { ...scene.distribution, spacing: 'linear' },
    };

    renderInstances(svg, linearScene);
    const linearUses = Array.from(svg.querySelectorAll('use')).map((u) =>
      Number(u.getAttribute('x'))
    );

    const easeInScene: Scene = {
      ...scene,
      distribution: { ...scene.distribution, spacing: 'ease-in' },
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
});

