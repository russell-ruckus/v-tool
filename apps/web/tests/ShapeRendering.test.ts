import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSquareSymbol,
  createCircleSymbol,
  createTriangleSymbol,
} from '../src/utils/shapes';

describe('Shape Symbols', () => {
  it('creates square symbol with correct geometry', () => {
    const symbol = createSquareSymbol();

    expect(symbol.id).toBe('shape-square');
    expect(symbol.getAttribute('viewBox')).toBe('-1 -1 2 2');
    expect(symbol.tagName.toLowerCase()).toBe('symbol');

    const rect = symbol.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('x')).toBe('-1');
    expect(rect?.getAttribute('y')).toBe('-1');
    expect(rect?.getAttribute('width')).toBe('2');
    expect(rect?.getAttribute('height')).toBe('2');
  });

  it('creates circle symbol with correct geometry', () => {
    const symbol = createCircleSymbol();

    expect(symbol.id).toBe('shape-circle');
    expect(symbol.getAttribute('viewBox')).toBe('-1 -1 2 2');
    expect(symbol.tagName.toLowerCase()).toBe('symbol');

    const circle = symbol.querySelector('circle');
    expect(circle).toBeTruthy();
    expect(circle?.getAttribute('cx')).toBe('0');
    expect(circle?.getAttribute('cy')).toBe('0');
    expect(circle?.getAttribute('r')).toBe('1');
  });

  it('creates triangle symbol with correct geometry', () => {
    const symbol = createTriangleSymbol();

    expect(symbol.id).toBe('shape-triangle');
    expect(symbol.getAttribute('viewBox')).toBe('-1 -1 2 2');
    expect(symbol.tagName.toLowerCase()).toBe('symbol');

    const polygon = symbol.querySelector('polygon');
    expect(polygon).toBeTruthy();
    expect(polygon?.getAttribute('points')).toBe('0,-1 -0.866,0.5 0.866,0.5');
  });

  it('all shapes use consistent coordinate system', () => {
    const square = createSquareSymbol();
    const circle = createCircleSymbol();
    const triangle = createTriangleSymbol();

    expect(square.getAttribute('viewBox')).toBe('-1 -1 2 2');
    expect(circle.getAttribute('viewBox')).toBe('-1 -1 2 2');
    expect(triangle.getAttribute('viewBox')).toBe('-1 -1 2 2');
  });
});

describe('Shape Rendering Integration', () => {
  let container: HTMLElement;
  let svg: SVGSVGElement;
  let defs: SVGDefsElement;

  beforeEach(() => {
    container = document.createElement('div');
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    container.appendChild(svg);
  });

  it('symbols can be added to <defs>', () => {
    const square = createSquareSymbol();
    defs.appendChild(square);

    const foundSymbol = defs.querySelector('#shape-square');
    expect(foundSymbol).toBeTruthy();
    expect(foundSymbol?.tagName.toLowerCase()).toBe('symbol');
  });

  it('<use> can reference symbol by ID', () => {
    const circle = createCircleSymbol();
    defs.appendChild(circle);

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#shape-circle');
    svg.appendChild(use);

    expect(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#shape-circle');
  });

  it('switching shapes updates <defs> correctly', () => {
    // Initial square
    const square = createSquareSymbol();
    defs.appendChild(square);
    expect(defs.querySelector('#shape-square')).toBeTruthy();

    // Clear and add circle
    defs.innerHTML = '';
    const circle = createCircleSymbol();
    defs.appendChild(circle);

    expect(defs.querySelector('#shape-square')).toBeNull();
    expect(defs.querySelector('#shape-circle')).toBeTruthy();
  });
});

