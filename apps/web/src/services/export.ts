/**
 * SVG export service
 * Handles serialization of SVG for download/sharing
 */

/**
 * Export SVG element as string
 * For MVP: simple serialization
 */
export function exportSVG(svgElement: SVGSVGElement): string {
  return svgElement.outerHTML;
}

/**
 * Debug helper for manual testing in browser console
 */
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__debugExport = () => {
    const svg = document.querySelector('svg');
    if (!svg) {
      console.warn('No SVG element found');
      return 'No SVG found';
    }
    const exported = exportSVG(svg);
    console.log('SVG exported:', exported);
    return exported;
  };
}

