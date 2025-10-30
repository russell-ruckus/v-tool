import { beforeEach, describe, it, expect } from 'vitest';
import {
  validateSVG,
  sanitizeSVG,
  normalizeSVG,
  createSymbolFromSVG,
  getUploadedSymbol,
  clearUploadedSymbolRegistry,
  ensureUploadedSymbol,
} from '../src/services/svgUpload';
import type { ShapeSource } from '@v-tool/shared';

const simplePath = '<svg viewBox="0 0 10 10"><path d="M0 0 L10 10"/></svg>';
const nestedGroups = '<svg><g><g><path d="M0 0 L1 1"/></g></g></svg>';
const multipleTop = '<svg><path d="M0 0 L1 1"/><path d="M0 1 L1 0"/></svg>';
const withScript = '<svg><script>alert(1)</script><path d="M0 0 L1 1"/></svg>';
const withStyle = '<svg><style>.st0{stroke:#fff;stroke-width:2}</style><path class="st0" d="M0 0 L1 1"/></svg>';
const withText = '<svg viewBox="0 0 10 10"><text>Hello</text></svg>';
const singleGroup = '<svg viewBox="0 0 10 10"><g><path d="M0 0 L10 10"/></g></svg>';
const gradientSvg =
  '<svg viewBox="0 0 10 10"><defs><linearGradient id="grad1"><stop offset="0%" stop-color="#123456"/><stop offset="100%" stop-color="#abcdef"/></linearGradient></defs><path fill="url(#grad1)" d="M0 0 L10 0"/></svg>';
const patternSvg =
  '<svg viewBox="0 0 10 10"><defs><pattern id="pat1" patternUnits="userSpaceOnUse" width="10" height="10"><rect width="10" height="10" fill="#ff0000"/></pattern></defs><rect width="5" height="5" fill="url(#pat1)"/></svg>';
const transformGroupSvg =
  '<svg viewBox="0 0 10 10"><g transform="translate(5,5)"><path d="M0 0 L5 0"/></g></svg>';

beforeEach(() => {
  clearUploadedSymbolRegistry();
});

describe('svgUpload validation and sanitization', () => {
  it('accepts single-path SVG', () => {
    const res = validateSVG(simplePath);
    expect(res.valid).toBe(true);
  });

  it('accepts single-group SVG with one child', () => {
    const res = validateSVG(singleGroup);
    expect(res.valid).toBe(true);
  });

  it('rejects nested groups', () => {
    const res = validateSVG(nestedGroups);
    expect(res.valid).toBe(false);
  });

  it('rejects multiple top-level elements', () => {
    const res = validateSVG(multipleTop);
    expect(res.valid).toBe(false);
  });

  it('rejects SVGs containing text elements', () => {
    const res = validateSVG(withText);
    expect(res.valid).toBe(false);
  });

  it('sanitizes scripts and produces parseable SVG', () => {
    const sanitized = sanitizeSVG(withScript);
    expect(sanitized).not.toContain('<script');
    const svg = normalizeSVG(sanitized);
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('applies class-based styles as attributes during sanitization', () => {
    const sanitized = sanitizeSVG(withStyle);
    expect(sanitized).toContain('stroke="#fff"');
    expect(sanitized).toContain('stroke-width="2"');
    expect(sanitized).not.toContain('<style');
    expect(sanitized).not.toContain('class="st0"');
  });

  it('converts gradient fills to solid colors', () => {
    const sanitized = sanitizeSVG(gradientSvg);
    expect(sanitized).toContain('fill="#123456"');
    expect(sanitized).not.toContain('linearGradient');
  });

  it('converts pattern fills to solid colors', () => {
    const sanitized = sanitizeSVG(patternSvg);
    expect(sanitized).toContain('fill="#ff0000"');
    expect(sanitized).not.toContain('pattern');
  });

  it('flattens group transforms into child geometry', () => {
    const sanitized = sanitizeSVG(transformGroupSvg);
    const normalized = normalizeSVG(sanitized);
    expect(normalized.querySelector('g')).toBeNull();
    const path = normalized.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('transform')).toBeNull();
    expect(path?.getAttribute('d')).toContain('5.000');
  });

  it('creates a symbol from normalized SVG', () => {
    const svg = normalizeSVG(simplePath);
    const { symbolId, symbol, viewBox, content } = createSymbolFromSVG(svg);
    expect(symbolId).toMatch(/^uploaded-shape-/);
    expect(symbol.tagName.toLowerCase()).toBe('symbol');
    expect(Array.isArray(viewBox) && viewBox.length === 4).toBe(true);
    const stored = getUploadedSymbol(symbolId);
    expect(stored).toBeTruthy();
    expect(stored?.querySelector('path')).toBeTruthy();

    clearUploadedSymbolRegistry();
    const uploadedShape: ShapeSource = {
      type: 'uploaded',
      symbolId,
      viewBox: [0, 0, 10, 10],
      content,
    };
    ensureUploadedSymbol(uploadedShape);
    const rehydrated = getUploadedSymbol(symbolId);
    expect(rehydrated).toBeTruthy();
  });
});


