/**
 * SVG shape symbol creation utilities
 * All shapes use normalized -1 to 1 coordinate system
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create square symbol
 * Centered at origin, 2x2 units
 */
export function createSquareSymbol(): SVGSymbolElement {
  const symbol = document.createElementNS(SVG_NS, 'symbol');
  symbol.id = 'shape-square';
  symbol.setAttribute('viewBox', '-1 -1 2 2');

  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', '-1');
  rect.setAttribute('y', '-1');
  rect.setAttribute('width', '2');
  rect.setAttribute('height', '2');

  symbol.appendChild(rect);
  return symbol;
}

/**
 * Create circle symbol
 * Centered at origin, radius 1
 */
export function createCircleSymbol(): SVGSymbolElement {
  const symbol = document.createElementNS(SVG_NS, 'symbol');
  symbol.id = 'shape-circle';
  symbol.setAttribute('viewBox', '-1 -1 2 2');

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '0');
  circle.setAttribute('cy', '0');
  circle.setAttribute('r', '1');

  symbol.appendChild(circle);
  return symbol;
}

/**
 * Create triangle symbol
 * Equilateral triangle, centered at origin
 */
export function createTriangleSymbol(): SVGSymbolElement {
  const symbol = document.createElementNS(SVG_NS, 'symbol');
  symbol.id = 'shape-triangle';
  symbol.setAttribute('viewBox', '-1 -1 2 2');

  const polygon = document.createElementNS(SVG_NS, 'polygon');
  // Equilateral triangle: top vertex at (0,-1), bottom vertices at 60° angles
  polygon.setAttribute('points', '0,-1 -0.866,0.5 0.866,0.5');

  symbol.appendChild(polygon);
  return symbol;
}

