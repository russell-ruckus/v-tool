import { describe, it, expect, beforeEach } from 'vitest';
import { Canvas } from '../src/components/canvas/Canvas';
import { init } from '../src/store/store';
import { createTestScene } from './testHelpers';

describe('Canvas', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    // Initialize store before each test
    init(createTestScene());
  });

  it('creates SVG element with correct namespace', () => {
    Canvas(root);
    const svg = root.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('sets viewBox attribute', () => {
    Canvas(root);
    const svg = root.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 800 600');
  });

  it('appends SVG to root element', () => {
    Canvas(root);
    expect(root.children.length).toBe(1);
    expect(root.children[0].tagName.toLowerCase()).toBe('svg');
  });

  it('returns cleanup function', () => {
    const cleanup = Canvas(root);
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(root.children.length).toBe(0);
  });
});

