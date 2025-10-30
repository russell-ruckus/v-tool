/**
 * SVG Upload: validation, sanitization, normalization, and symbol creation
 */

import type { ShapeSource } from '@v-tool/shared';

const SVG_NS = 'http://www.w3.org/2000/svg';

const uploadedSymbolRegistry = new Map<string, SVGSymbolElement>();

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function registerUploadedSymbol(symbolId: string, symbol: SVGSymbolElement): void {
  uploadedSymbolRegistry.set(symbolId, symbol.cloneNode(true) as SVGSymbolElement);
}

export function getUploadedSymbol(symbolId: string): SVGSymbolElement | undefined {
  const stored = uploadedSymbolRegistry.get(symbolId);
  return stored ? (stored.cloneNode(true) as SVGSymbolElement) : undefined;
}

export function hydrateUploadedSymbol(symbolId: string, content: string): void {
  if (uploadedSymbolRegistry.has(symbolId) || !content) {
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg xmlns="${SVG_NS}">${content}</svg>`, 'image/svg+xml');
  const symbol = doc.querySelector('symbol');
  if (symbol) {
    registerUploadedSymbol(symbolId, symbol as SVGSymbolElement);
  }
}

export function ensureUploadedSymbol(shape: ShapeSource): void {
  if (shape.type !== 'uploaded') {
    return;
  }
  if (uploadedSymbolRegistry.has(shape.symbolId)) {
    return;
  }
  if (shape.content) {
    hydrateUploadedSymbol(shape.symbolId, shape.content);
  }
}

export function clearUploadedSymbolRegistry(): void {
  uploadedSymbolRegistry.clear();
}

export function validateSVG(svgText: string): ValidationResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;
  if (!(root instanceof SVGSVGElement) || root.tagName.toLowerCase() !== 'svg') {
    return { valid: false, reason: 'Not an SVG document' };
  }
  const svg = root;
  // Reject dangerous/complex elements (scripts, use, image, text, animation)
  if (doc.querySelector('script, use, image, text, animate, animateTransform, foreignObject')) {
    return { valid: false, reason: 'Unsupported elements: scripts/use/image/text/animation not allowed' };
  }
  // Count top-level graphical elements (ignoring defs/style which will be stripped)
  const children = Array.from(svg.children).filter((el) => isGraphicElement(el as SVGGraphicsElement));
  if (children.length !== 1) {
    return { valid: false, reason: 'SVG must contain exactly one top-level graphic element (<g>, <path>, or basic shape)' };
  }
  const child = children[0];
  if (child.tagName.toLowerCase() === 'g') {
    // Reject nested groups
    if ((child as SVGGElement).querySelector('g')) {
      return { valid: false, reason: 'Nested groups are not supported' };
    }
  } else if (!isAllowedSingleShape(child as Element)) {
    return { valid: false, reason: 'Only single <path> or single basic shape allowed' };
  }
  return { valid: true };
}

export function sanitizeSVG(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  // Extract CSS rules from <style> blocks and inline them
  const styleMap = new Map<string, Record<string, string>>();
  doc.querySelectorAll('style').forEach((styleEl) => {
    const cssText = styleEl.textContent || '';
    const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    let match: RegExpExecArray | null;
    while ((match = ruleRegex.exec(cssText))) {
      const className = match[1];
      const rules = match[2];
      const props: Record<string, string> = {};
      rules.split(';').forEach((rule) => {
        const [key, val] = rule.split(':').map((s) => s.trim());
        if (key && val) {
          props[key] = val;
        }
      });
      styleMap.set(className, props);
    }
  });

  doc.querySelectorAll('*').forEach((el) => {
    const className = el.getAttribute('class');
    if (className && styleMap.has(className)) {
      const styles = styleMap.get(className)!;
      Object.entries(styles).forEach(([key, val]) => {
        if (!el.hasAttribute(key)) {
          el.setAttribute(key, val);
        }
      });
    }
  });

  // Precompute paint fallback colours for gradients/patterns
  const paintFallbackMap = new Map<string, string>();

  doc.querySelectorAll('linearGradient, radialGradient').forEach((gradient) => {
    const id = gradient.getAttribute('id');
    if (!id) {
      return;
    }
    const firstStop = gradient.querySelector('stop');
    const color = firstStop ? extractStopColor(firstStop) : null;
    if (color) {
      paintFallbackMap.set(id, color);
    }
  });

  doc.querySelectorAll('pattern').forEach((pattern) => {
    const id = pattern.getAttribute('id');
    if (!id) {
      return;
    }
    const color = extractPatternColor(pattern as SVGPatternElement);
    if (color) {
      paintFallbackMap.set(id, color);
    }
  });

  // Remove disallowed structural elements after data extraction
  doc
    .querySelectorAll(
      'script, style, defs, use, image, foreignObject, animate, animateTransform, linearGradient, radialGradient, pattern'
    )
    .forEach((n) => n.remove());

  // Remove/replace unsafe attributes
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith('on') || name === 'class' || name === 'id' || name === 'filter' || name === 'style') {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === 'fill' || name === 'stroke') && value.startsWith('url(')) {
        const paintId = extractPaintId(value);
        const fallback = paintId ? paintFallbackMap.get(paintId) : undefined;
        if (fallback) {
          el.setAttribute(attr.name, fallback);
        } else {
          el.removeAttribute(attr.name);
        }
        return;
      }

      if ((name === 'href' || name === 'xlink:href') && /^https?:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return new XMLSerializer().serializeToString(doc);
}

export function normalizeSVG(svgText: string): SVGSVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;
  if (!(root instanceof SVGSVGElement)) {
    throw new Error('Provided markup is not an SVG document');
  }
  const svg = root;

  if (!svg.getAttribute('viewBox')) {
    const width = parseFloat(svg.getAttribute('width') || '100');
    const height = parseFloat(svg.getAttribute('height') || '100');
    svg.setAttribute('viewBox', `0 0 ${isFinite(width) ? width : 100} ${isFinite(height) ? height : 100}`);
  }

  try {
    flattenElement(svg, identityMatrix());
  } catch {
    // Best-effort: leave remaining transforms intact if flattening fails
  }

  return svg;
}

export function extractViewBox(svg: SVGSVGElement): [number, number, number, number] {
  const vb = svg.getAttribute('viewBox');
  if (vb) {
    const parts = vb.split(/\s+|,/).map((v) => parseFloat(v));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1], parts[2], parts[3]];
    }
  }
  return [0, 0, 100, 100];
}

export function createSymbolFromSVG(
  svg: SVGSVGElement
): { symbolId: string; symbol: SVGSymbolElement; viewBox: [number, number, number, number]; content: string } {
  const symbol = document.createElementNS(SVG_NS, 'symbol');
  const viewBox = extractViewBox(svg);
  symbol.setAttribute('viewBox', viewBox.join(' '));
  const content = Array.from(svg.children).filter((el) => isGraphicElement(el as SVGGraphicsElement));
  content.forEach((el) => symbol.appendChild(el.cloneNode(true)));
  const symbolId = `uploaded-shape-${Date.now()}`;
  symbol.id = symbolId;
  registerUploadedSymbol(symbolId, symbol);
  const serialized = new XMLSerializer().serializeToString(symbol);
  return { symbolId, symbol, viewBox, content: serialized };
}

// Utilities
function isGraphicElement(el: SVGElement): boolean {
  const n = el.tagName.toLowerCase();
  return n === 'g' || n === 'path' || n === 'rect' || n === 'circle' || n === 'ellipse' || n === 'polygon' || n === 'polyline' || n === 'line';
}

function isAllowedSingleShape(el: Element): boolean {
  const n = el.tagName.toLowerCase();
  return n === 'path' || n === 'rect' || n === 'circle' || n === 'ellipse' || n === 'polygon' || n === 'polyline' || n === 'line';
}

// Minimal transform to matrix and apply-to-path implementation
type Matrix = [number, number, number, number, number, number]; // a b c d e f

function parseTransformToMatrix(transform: string): Matrix {
  // Supports translate(x,y), scale(x[,y]), rotate(a)
  let a = 1, b = 0, c = 0, d = 1, e = 0, f = 0;
  const re = /(translate|scale|rotate)\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(transform))) {
    const type = m[1];
    const nums = m[2].split(/[ ,]+/).map((v) => parseFloat(v));
    if (type === 'translate') {
      e += nums[0] || 0;
      f += (nums[1] || 0);
    } else if (type === 'scale') {
      const sx = nums[0] ?? 1;
      const sy = nums[1] ?? sx;
      a *= sx; d *= sy;
    } else if (type === 'rotate') {
      const angle = (nums[0] || 0) * Math.PI / 180;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const na = a * cos + c * sin;
      const nc = -a * sin + c * cos;
      const nb = b * cos + d * sin;
      const nd = -b * sin + d * cos;
      a = na; b = nb; c = nc; d = nd;
    }
  }
  return [a, b, c, d, e, f];
}

function applyMatrixToPathData(d: string, m: Matrix): string {
  const cmds = d.match(/[a-df-zA-DF-Z]|-?\d*\.?\d+(?:e[+-]?\d+)?/g) || [];
  const out: string[] = [];
  let i = 0;
  while (i < cmds.length) {
    const token = cmds[i++];
    if (!token) break;
    if (/[a-zA-Z]/.test(token)) {
      out.push(token);
      continue;
    }
    const x = parseFloat(token);
    const y = parseFloat(cmds[i++] || '0');
    const [a, b, c, d, e, f] = m;
    const nx = a * x + c * y + e;
    const ny = b * x + d * y + f;
    out.push(nx.toFixed(3), ny.toFixed(3));
  }
  return out.join(' ');
}

function extractStopColor(stop: Element): string | null {
  const direct = stop.getAttribute('stop-color');
  if (direct && !direct.startsWith('url(')) {
    return direct;
  }
  const styleAttr = stop.getAttribute('style') ?? '';
  const match = styleAttr.match(/stop-color\s*:\s*([^;]+)/i);
  if (match) {
    return match[1].trim();
  }
  return null;
}

function extractPatternColor(pattern: SVGPatternElement): string | null {
  const candidates = Array.from(pattern.querySelectorAll('*')) as SVGElement[];
  for (const el of candidates) {
    const fill = el.getAttribute('fill');
    if (fill && !fill.startsWith('url(')) {
      return fill;
    }
    const stroke = el.getAttribute('stroke');
    if (stroke && !stroke.startsWith('url(')) {
      return stroke;
    }
    const styleAttr = el.getAttribute('style') ?? '';
    const fillMatch = styleAttr.match(/fill\s*:\s*([^;]+)/i);
    if (fillMatch && !fillMatch[1].trim().startsWith('url(')) {
      return fillMatch[1].trim();
    }
    const strokeMatch = styleAttr.match(/stroke\s*:\s*([^;]+)/i);
    if (strokeMatch && !strokeMatch[1].trim().startsWith('url(')) {
      return strokeMatch[1].trim();
    }
  }
  return null;
}

function extractPaintId(value: string): string | null {
  const match = value.match(/url\(#([^\)]+)\)/i);
  return match ? match[1] : null;
}

function identityMatrix(): Matrix {
  return [1, 0, 0, 1, 0, 0];
}

function multiplyMatrices(m1: Matrix, m2: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function isIdentityMatrix(matrix: Matrix): boolean {
  const [a, b, c, d, e, f] = matrix;
  return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
}

function applyMatrixToElement(el: SVGElement, matrix: Matrix): void {
  if (isIdentityMatrix(matrix)) {
    return;
  }

  const tag = el.tagName.toLowerCase();
  if (tag === 'path') {
    const d = (el as SVGPathElement).getAttribute('d');
    if (d) {
      const newD = applyMatrixToPathData(d, matrix);
      (el as SVGPathElement).setAttribute('d', newD);
    }
    return;
  }

  const existing = el.getAttribute('transform');
  const formattedMatrix = matrix
    .map((n) => (Number.isInteger(n) ? n.toString() : Number(n.toFixed(3)).toString()))
    .join(' ');
  const matrixStr = `matrix(${formattedMatrix})`;
  el.setAttribute('transform', existing ? `${matrixStr} ${existing}` : matrixStr);
}

function flattenElement(node: SVGElement, incoming: Matrix): void {
  let localMatrix = incoming;
  const transformAttr = node.getAttribute('transform');
  if (transformAttr) {
    const parsed = parseTransformToMatrix(transformAttr);
    localMatrix = multiplyMatrices(incoming, parsed);
    node.removeAttribute('transform');
  }

  if (node.tagName.toLowerCase() === 'svg') {
    Array.from(node.children).forEach((child) => {
      if (child instanceof SVGElement) {
        flattenElement(child, localMatrix);
      }
    });
    return;
  }

  if (node.tagName.toLowerCase() === 'g') {
    const parent = node.parentNode;
    const groupChildren = Array.from(node.children);
    groupChildren.forEach((child) => {
      if (child instanceof SVGElement) {
        flattenElement(child, localMatrix);
        parent?.insertBefore(child, node);
      }
    });
    parent?.removeChild(node);
    return;
  }

  if (isGraphicElement(node)) {
    applyMatrixToElement(node, localMatrix);
  }
}


