import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  savePreset,
  loadPreset,
  listPresets,
  deletePreset,
  renamePreset,
} from '../src/services/presets';
import { init, loadScene, getState, subscribe } from '../src/store/store';
import { createTestScene } from './testHelpers';
import type { Scene } from '@v-tool/shared';
import {
  clearUploadedSymbolRegistry,
  createSymbolFromSVG,
  ensureUploadedSymbol,
  getUploadedSymbol,
  normalizeSVG,
  sanitizeSVG,
} from '../src/services/svgUpload';

describe('Preset Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  it('persists uploaded symbol content and rehydrates registry on load', () => {
    clearUploadedSymbolRegistry();

    const sanitized = sanitizeSVG('<svg viewBox="0 0 10 10"><path d="M0 0 L10 10"/></svg>');
    const normalized = normalizeSVG(sanitized);
    const { symbolId, viewBox, content } = createSymbolFromSVG(normalized);

    const scene = createTestScene({
      shape: {
        type: 'uploaded',
        symbolId,
        viewBox,
        content,
      } as Scene['shape'],
    });

    savePreset('uploaded', scene);

    clearUploadedSymbolRegistry();
    const loaded = loadPreset('uploaded');
    expect(loaded).toBeTruthy();
    expect((loaded!.shape as { content?: string }).content).toBe(content);

    clearUploadedSymbolRegistry();
    ensureUploadedSymbol(loaded!.shape);
    loadScene(loaded!);
    const rehydrated = getUploadedSymbol(symbolId);
    expect(rehydrated).toBeTruthy();
  });

  it('savePreset stores scene correctly', () => {
    const scene = createTestScene({
      rng: { seed: 12345 },
      shape: { type: 'basic', shape: 'circle' },
    });

    savePreset('test-preset', scene);

    const stored = localStorage.getItem('preset:test-preset');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.rng.seed).toBe(12345);
    expect(parsed.shape.shape).toBe('circle');
  });

  it('savePreset throws error for empty name', () => {
    const scene = createTestScene();
    expect(() => savePreset('', scene)).toThrow('Preset name cannot be empty');
    expect(() => savePreset('   ', scene)).toThrow('Preset name cannot be empty');
  });

  it('loadPreset retrieves scene correctly', () => {
    const scene = createTestScene({
      rng: { seed: 99999 },
      shape: { type: 'basic', shape: 'triangle' },
    });

    savePreset('load-test', scene);
    const loaded = loadPreset('load-test');

    expect(loaded).toBeTruthy();
    expect(loaded?.rng.seed).toBe(99999);
    expect(loaded?.shape.type).toBe('basic');
    expect((loaded?.shape as { shape: string }).shape).toBe('triangle');
  });

  it('loadPreset returns null for non-existent preset', () => {
    const loaded = loadPreset('non-existent');
    expect(loaded).toBeNull();
  });

  it('loadPreset returns null for empty name', () => {
    const loaded = loadPreset('');
    expect(loaded).toBeNull();
  });

  it('loadPreset handles corrupted data gracefully', () => {
    localStorage.setItem('preset:corrupted', 'invalid json {');
    const loaded = loadPreset('corrupted');
    expect(loaded).toBeNull();
  });

  it('loadPreset validates scene structure', () => {
    // Store incomplete scene data
    localStorage.setItem('preset:incomplete', JSON.stringify({ id: '1' }));
    const loaded = loadPreset('incomplete');
    expect(loaded).toBeNull();
  });

  it('listPresets returns all preset names', () => {
    const scene1 = createTestScene();
    const scene2 = createTestScene();
    const scene3 = createTestScene();

    savePreset('preset-a', scene1);
    savePreset('preset-b', scene2);
    savePreset('preset-c', scene3);

    const presets = listPresets();
    expect(presets).toHaveLength(3);
    expect(presets).toContain('preset-a');
    expect(presets).toContain('preset-b');
    expect(presets).toContain('preset-c');
  });

  it('listPresets returns sorted names', () => {
    savePreset('z-preset', createTestScene());
    savePreset('a-preset', createTestScene());
    savePreset('m-preset', createTestScene());

    const presets = listPresets();
    expect(presets).toEqual(['a-preset', 'm-preset', 'z-preset']);
  });

  it('listPresets ignores non-preset localStorage keys', () => {
    localStorage.setItem('other-key', 'value');
    localStorage.setItem('another-key', 'value');
    savePreset('preset-1', createTestScene());

    const presets = listPresets();
    expect(presets).toEqual(['preset-1']);
  });

  it('listPresets returns empty array when no presets', () => {
    const presets = listPresets();
    expect(presets).toEqual([]);
  });

  it('deletePreset removes preset from storage', () => {
    const scene = createTestScene();
    savePreset('to-delete', scene);

    expect(loadPreset('to-delete')).toBeTruthy();

    deletePreset('to-delete');

    expect(loadPreset('to-delete')).toBeNull();
    expect(listPresets()).not.toContain('to-delete');
  });

  it('deletePreset throws error for empty name', () => {
    expect(() => deletePreset('')).toThrow('Preset name cannot be empty');
  });

  it('renamePreset changes preset name', () => {
    const scene = createTestScene({ rng: { seed: 55555 } });
    savePreset('old-name', scene);

    const success = renamePreset('old-name', 'new-name');

    expect(success).toBe(true);
    expect(loadPreset('old-name')).toBeNull();
    expect(loadPreset('new-name')).toBeTruthy();
    expect(loadPreset('new-name')?.rng.seed).toBe(55555);
  });

  it('renamePreset returns false if new name exists', () => {
    const scene1 = createTestScene({ rng: { seed: 111 } });
    const scene2 = createTestScene({ rng: { seed: 222 } });

    savePreset('existing', scene1);
    savePreset('to-rename', scene2);

    const success = renamePreset('to-rename', 'existing');
    expect(success).toBe(false);

    // Original preset should still exist
    expect(loadPreset('to-rename')).toBeTruthy();
    expect(loadPreset('to-rename')?.rng.seed).toBe(222);
    // Target preset should be unchanged
    expect(loadPreset('existing')?.rng.seed).toBe(111);
  });

  it('renamePreset returns true if names are the same (no-op)', () => {
    const scene = createTestScene();
    savePreset('same-name', scene);

    const success = renamePreset('same-name', 'same-name');
    expect(success).toBe(true);
    expect(loadPreset('same-name')).toBeTruthy();
  });

  it('renamePreset throws error if preset does not exist', () => {
    expect(() => renamePreset('non-existent', 'new-name')).toThrow(
      'Preset "non-existent" does not exist'
    );
  });

  it('renamePreset throws error for empty names', () => {
    expect(() => renamePreset('', 'new')).toThrow('Preset names cannot be empty');
    expect(() => renamePreset('old', '')).toThrow('Preset names cannot be empty');
  });

  it('handles localStorage quota exceeded', () => {
    // Mock localStorage to throw quota exceeded error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      (error as any).name = 'QuotaExceededError';
      throw error;
    });

    const scene = createTestScene();
    expect(() => savePreset('quota-test', scene)).toThrow(
      'Storage quota exceeded. Please delete some presets and try again.'
    );

    // Restore original
    setItemSpy.mockRestore();
  });
});

describe('Preset Store Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    const scene = createTestScene();
    init(scene);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loadScene applies preset to store correctly', () => {
    const originalScene = getState();
    const newScene = createTestScene({
      rng: { seed: 77777 },
      shape: { type: 'basic', shape: 'triangle' },
      style: { fill: '#ff0000', stroke: '#00ff00', strokeWidth: 5, background: '#0000ff' },
    });

    savePreset('integration-test', newScene);
    const loaded = loadPreset('integration-test');

    expect(loaded).toBeTruthy();

    loadScene(loaded!);

    const updatedState = getState();
    expect(updatedState.rng.seed).toBe(77777);
    expect((updatedState.shape as { shape: string }).shape).toBe('triangle');
    expect(updatedState.style.fill).toBe('#ff0000');
    expect(updatedState.style.stroke).toBe('#00ff00');
    expect(updatedState.style.strokeWidth).toBe(5);
    expect(updatedState.style.background).toBe('#0000ff');
  });

  it('loadScene triggers re-render for subscribers', () => {
    let callbackCalled = false;
    let callbackScene: Scene | null = null;

    const unsubscribe = subscribe((scene: Scene) => {
      callbackCalled = true;
      callbackScene = scene;
    });

    const newScene = createTestScene({ rng: { seed: 88888 } });
    loadScene(newScene);

    expect(callbackCalled).toBe(true);
    expect(callbackScene?.rng.seed).toBe(88888);

    unsubscribe();
  });

  it('loadScene preserves all scene properties', () => {
    const completeScene = createTestScene({
      rng: { seed: 99999 },
      shape: { type: 'basic', shape: 'circle' },
      distribution: {
        mode: 'particle',
        particle: { type: 'grid', density: 15, jitter: 0.5 },
      },
      transform: {
        depthRange: [0.2, 0.8],
        scaleRange: [0.7, 1.3],
        rotation: { mode: 'range', min: 45, max: 90 },
        sortByDepth: true,
      },
      style: {
        fill: '#123456',
        stroke: '#789abc',
        strokeWidth: 3,
        background: '#def012',
      },
      view: {
        pan: { x: 10, y: 20 },
        zoom: 1.5,
        overlayVisible: false,
      },
      viewport: {
        aspect: '1:1',
        orientation: 'portrait',
        width: 500,
      },
      export: {
        precision: 3,
        useSymbols: true,
        clipToViewport: false,
      },
    });

    loadScene(completeScene);
    const state = getState();

    expect(state.rng.seed).toBe(99999);
    expect((state.shape as { shape: string }).shape).toBe('circle');
    expect(state.distribution.mode).toBe('particle');
    if (state.distribution.mode === 'particle') {
      expect(state.distribution.particle.type).toBe('grid');
      expect(state.distribution.particle.density).toBe(15);
    }
    expect(state.transform.depthRange).toEqual([0.2, 0.8]);
    expect(state.transform.scaleRange).toEqual([0.7, 1.3]);
    expect(state.transform.rotation.mode).toBe('range');
    expect(state.transform.sortByDepth).toBe(true);
    expect(state.style.fill).toBe('#123456');
    expect(state.view.pan.x).toBe(10);
    expect(state.view.pan.y).toBe(20);
    expect(state.view.zoom).toBe(1.5);
    expect(state.viewport.aspect).toBe('1:1');
    expect(state.viewport.orientation).toBe('portrait');
    expect(state.export.precision).toBe(3);
  });
});

