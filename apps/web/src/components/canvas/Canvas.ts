/**
 * Canvas component - renders SVG scene with shapes
 */
import { getState, subscribe } from '../../store/store';
import { renderInstances } from './Renderer';
import {
  createSquareSymbol,
  createCircleSymbol,
  createTriangleSymbol,
} from '../../utils/shapes';
import type { ShapeSource } from '@v-tool/shared';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Update shape definitions in <defs>
 */
function updateShapeDefinitions(defs: SVGDefsElement, shape: ShapeSource): void {
  // Clear existing symbols
  defs.innerHTML = '';

  // Add appropriate symbol based on shape
  if (shape.type === 'basic') {
    let symbol: SVGSymbolElement;

    switch (shape.shape) {
      case 'square':
        symbol = createSquareSymbol();
        break;
      case 'circle':
        symbol = createCircleSymbol();
        break;
      case 'triangle':
        symbol = createTriangleSymbol();
        break;
    }

    defs.appendChild(symbol);
  } else if (shape.type === 'uploaded') {
    // Future: handle uploaded SVG symbols
    console.warn('Uploaded shapes not yet implemented');
  }
}

export function Canvas(root: HTMLElement) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'V-Tool canvas for SVG instance distribution');
  svg.style.background = '#fff';
  svg.style.border = '1px solid #ccc';

  // Create <defs> section for shape symbols
  const defs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(defs);

  root.appendChild(svg);

  // Subscribe to state changes
  const unsub = subscribe((scene) => {
    updateShapeDefinitions(defs, scene.shape);
    renderInstances(svg, scene);
  });

  // Initial render
  const initialScene = getState();
  updateShapeDefinitions(defs, initialScene.shape);
  renderInstances(svg, initialScene);

  // Return cleanup function
  return () => {
    unsub();
    // Defensive check: only remove if still a child
    if (svg.parentNode === root) {
      root.removeChild(svg);
    }
  };
}
