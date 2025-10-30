/**
 * SVG export service
 * Handles serialization of SVG for download/sharing with clipPath and precision
 */
import type { Scene } from '@v-tool/shared';
import { computeViewportSize } from '../utils/view';
import {
  formatSVGAttribute,
  formatTransformValue,
} from '../utils/precision';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Apply precision formatting to SVG element and its children
 */
function applyPrecisionToElement(
  element: Element,
  precision: number
): void {
  // Format numeric attributes
  const numericAttrs = ['x', 'y', 'width', 'height', 'stroke-width', 'cx', 'cy', 'r', 'rx', 'ry'];
  for (const attr of numericAttrs) {
    const value = element.getAttribute(attr);
    if (value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        element.setAttribute(attr, formatSVGAttribute(num, precision));
      }
    }
  }

  // Format transform attribute
  const transform = element.getAttribute('transform');
  if (transform) {
    const formatted = formatTransform(transform, precision);
    if (formatted) {
      element.setAttribute('transform', formatted);
    }
  }

  // Format viewBox
  if (element.tagName === 'svg') {
    const viewBox = element.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(v => parseFloat(v));
      if (parts.length === 4 && parts.every(p => !isNaN(p))) {
        const formatted = parts.map(p => formatSVGAttribute(p, precision)).join(' ');
        element.setAttribute('viewBox', formatted);
      }
    }
  }

  // Recurse to children
  Array.from(element.children).forEach(child => {
    applyPrecisionToElement(child, precision);
  });
}

/**
 * Format transform string values
 * Handles: translate(x y), scale(x), scale(x y), rotate(angle cx cy), etc.
 */
function formatTransform(transform: string, precision: number): string {
  return transform.replace(/(-?\d+\.?\d*)/g, (match) => {
    const num = parseFloat(match);
    if (!isNaN(num)) {
      return formatTransformValue(num, precision);
    }
    return match;
  });
}

/**
 * Export SVG element as string with clipPath and precision formatting
 */
export function exportSVG(svgElement: SVGSVGElement, scene: Scene): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const precision = scene.export.precision;
  // Ensure XML namespaces are present for correct parsing
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', SVG_NS);
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  // Reset world transform (remove pan/zoom) - center at origin
  const worldGroup = clone.querySelector('#world') as SVGGElement | null;
  if (worldGroup) {
    worldGroup.setAttribute('transform', 'translate(400 300) scale(1) translate(0 0)');
  }

  // Remove overlay elements
  [
    '#viewport-overlay',
    '#viewport-overlay-shade',
    '#viewport-overlay-guide-horizontal',
    '#viewport-overlay-guide-vertical',
    '#viewport-overlay-group',
  ].forEach((selector) => {
    const element = clone.querySelector(selector);
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  // Apply clipPath if clipToViewport is enabled
  if (scene.export.clipToViewport && worldGroup) {
    const viewportSize = computeViewportSize(scene);
    const halfWidth = viewportSize.width / 2;
    const halfHeight = viewportSize.height / 2;
    
    // Viewport centered at canvas center (400, 300), but in world space it's at (0, 0)
    // World group is already centered at (400, 300) in SVG coords, so clipPath should be
    // centered relative to the world group transform
    const clipX = -halfWidth;
    const clipY = -halfHeight;

    // Ensure defs exists
    let defs = clone.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      clone.insertBefore(defs, clone.firstChild);
    }

    // Create clipPath
    const clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.setAttribute('id', 'viewport-clip');
    const clipRect = document.createElementNS(SVG_NS, 'rect');
    clipRect.setAttribute('x', formatSVGAttribute(clipX, precision));
    clipRect.setAttribute('y', formatSVGAttribute(clipY, precision));
    clipRect.setAttribute('width', formatSVGAttribute(viewportSize.width, precision));
    clipRect.setAttribute('height', formatSVGAttribute(viewportSize.height, precision));
    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);

    // Apply clipPath to world group
    worldGroup.setAttribute('clip-path', 'url(#viewport-clip)');
  }

  // Apply precision formatting to all elements
  applyPrecisionToElement(clone, precision);

  return clone.outerHTML;
}

/**
 * Download SVG as file
 */
export function downloadSVG(svgString: string, filename: string = 'export.svg'): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Estimate file size in KB
 */
export function estimateFileSize(svgString: string): number {
  const sizeInBytes = new Blob([svgString]).size;
  return Math.round((sizeInBytes / 1024) * 10) / 10; // Round to 1 decimal place
}

/**
 * Debug helper for manual testing in browser console
 */
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__debugExport = (scene?: Scene) => {
    const svg = document.querySelector('svg');
    if (!svg) {
      console.warn('No SVG element found');
      return 'No SVG found';
    }
    if (!scene) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { getState } = require('../store/store');
      scene = getState();
    }
    const exported = exportSVG(svg as SVGSVGElement, scene);
    console.log('SVG exported:', exported);
    return exported;
  };
}

