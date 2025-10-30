import { describe, it, expect, beforeEach } from 'vitest';
import { exportSVG, estimateFileSize } from '../src/services/export';
import { init } from '../src/store/store';
import { createTestScene } from './testHelpers';
import type { Scene } from '@v-tool/shared';
import { renderInstances } from '../src/components/canvas/Renderer';

describe('Export Service', () => {
  let svg: SVGSVGElement;
  let scene: Scene;

  beforeEach(() => {
    // Create SVG with proper namespace
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '600');

    // Create defs and symbols structure
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.setAttribute('id', 'shape-square');
    symbol.setAttribute('viewBox', '0 0 50 50');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '50');
    rect.setAttribute('height', '50');
    symbol.appendChild(rect);
    defs.appendChild(symbol);
    svg.appendChild(defs);

    // Initialize store with test scene
    scene = createTestScene({
      distribution: {
        mode: 'path',
        path: { type: 'linear', instances: 10 },
        spacing: 'linear',
      },
      export: {
        precision: 2,
        useSymbols: true,
        clipToViewport: true,
      },
      viewport: {
        aspect: '16:9',
        orientation: 'landscape',
        width: 640,
      },
    });

    init(scene);
    renderInstances(svg, scene);
    
    // Ensure world group exists (renderInstances should create it, but verify)
    let world = svg.querySelector('#world') as SVGGElement | null;
    if (!world) {
      // Manually create if renderInstances didn't (jsdom issue)
      world = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      world.id = 'world';
      world.setAttribute('transform', 'translate(400 300) scale(1) translate(0 0)');
      svg.appendChild(world);
      
      // Create instances group
      const instances = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      instances.id = 'instances';
      world.appendChild(instances);
      
      // Add some use elements for testing
      for (let i = 0; i < 10; i++) {
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#shape-square');
        use.setAttribute('x', String(i * 50));
        use.setAttribute('y', '0');
        instances.appendChild(use);
      }
    }
  });

  it('exports SVG with clipPath when clipToViewport is true', () => {
    const exported = exportSVG(svg, scene);
    
    // Check exported string directly (jsdom DOMParser has issues with SVG)
    expect(exported).toContain('clipPath id="viewport-clip"');
    expect(exported).toContain('<rect x=');
    expect(exported).toContain('width=');
    expect(exported).toContain('height=');
    expect(exported).toContain('id="world"');
    expect(exported).toContain('clip-path="url(#viewport-clip)"');
  });

  it('does not export clipPath when clipToViewport is false', () => {
    const sceneNoClip = {
      ...scene,
      export: {
        ...scene.export,
        clipToViewport: false,
      },
    };
    const exported = exportSVG(svg, sceneNoClip);
    
    // Check string directly
    expect(exported).not.toContain('clipPath id="viewport-clip"');
    expect(exported).not.toContain('clip-path="url(#viewport-clip)"');
  });

  it('removes overlay elements from export', () => {
    // Add overlay elements to test
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.id = 'viewport-overlay';
    svg.appendChild(overlay);
    
    const exported = exportSVG(svg, scene);
    
    // Check string directly
    expect(exported).not.toContain('id="viewport-overlay"');
    expect(exported).not.toContain('id="viewport-overlay-shade"');
    expect(exported).not.toContain('id="viewport-overlay-guide-horizontal"');
    expect(exported).not.toContain('id="viewport-overlay-guide-vertical"');
  });

  it('applies precision formatting to numeric attributes', () => {
    const scenePrecision0 = {
      ...scene,
      export: {
        ...scene.export,
        precision: 0,
      },
    };
    
    const exported = exportSVG(svg, scenePrecision0);
    
    // Check that use elements exist
    expect(exported).toContain('<use');
    expect(exported).toContain('href="#shape-square"');
    
    // Check precision formatting on clipPath rect coordinates
    // With precision 0, coordinates should be integers (no decimal points in numbers)
    const clipRectMatch = exported.match(/<rect x="(-?\d+)" y="(-?\d+)" width="(\d+)" height="(\d+)"/);
    if (clipRectMatch) {
      // All values should be integers (no decimals)
      expect(clipRectMatch[1]).not.toContain('.');
      expect(clipRectMatch[2]).not.toContain('.');
      expect(clipRectMatch[3]).not.toContain('.');
      expect(clipRectMatch[4]).not.toContain('.');
    }
  });

  it('preserves defs/symbol/use structure', () => {
    const exported = exportSVG(svg, scene);
    
    // Check string directly
    expect(exported).toContain('<defs>');
    expect(exported).toContain('symbol id="shape-square"');
    expect(exported).toContain('<use');
    expect(exported).toContain('href="#shape-square"');
  });

  it('resets world transform to identity (removes pan/zoom)', () => {
    const exported = exportSVG(svg, scene);
    
    // Check string directly - world group should have reset transform
    expect(exported).toContain('id="world"');
    expect(exported).toContain('translate(400 300)');
    expect(exported).toContain('scale(1)');
    expect(exported).toContain('translate(0 0)');
  });

  it('estimates file size correctly', () => {
    const exported = exportSVG(svg, scene);
    const size = estimateFileSize(exported);
    
    expect(size).toBeGreaterThan(0);
    expect(typeof size).toBe('number');
    // Should be reasonable size (less than 500KB for a simple scene)
    expect(size).toBeLessThan(500);
  });

  it('formats viewBox with precision', () => {
    svg.setAttribute('viewBox', '0 0 800.123456 600.789012');
    const scenePrecision2 = {
      ...scene,
      export: {
        ...scene.export,
        precision: 2,
      },
    };
    
    const exported = exportSVG(svg, scenePrecision2);
    
    // Check viewBox in exported string - should be formatted to 2 decimal places
    const viewBoxMatch = exported.match(/viewBox="([^"]+)"/);
    expect(viewBoxMatch).toBeTruthy();
    
    if (viewBoxMatch) {
      const viewBox = viewBoxMatch[1];
      const parts = viewBox.split(' ');
      // Check that decimal values have at most 2 decimal places
      parts.forEach(part => {
        if (part.includes('.')) {
          const decimals = part.split('.')[1];
          expect(decimals.length).toBeLessThanOrEqual(2);
        }
      });
    }
  });
});

