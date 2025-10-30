/**
 * Global state management store
 * Observable pattern for reactive updates
 */
import type { Scene, View, Viewport, ShapeSource } from '@v-tool/shared';
import { ensureUploadedSymbol } from '../services/svgUpload';

let scene: Scene;
const listeners = new Set<(s: Scene) => void>();

/**
 * Initialize store with initial scene
 */
export function init(initial: Scene): void {
  scene = initial;
  ensureUploadedSymbol(initial.shape);
}

/**
 * Get current scene state
 */
export function getState(): Scene {
  return scene;
}

/**
 * Update scene with partial patch
 * Notifies all subscribers
 */
export function update(patch: Partial<Scene>): void {
  if (patch.shape && typeof patch.shape === 'object' && 'type' in patch.shape) {
    ensureUploadedSymbol(patch.shape as ShapeSource);
  }
  scene = { ...scene, ...patch };
  listeners.forEach((l) => l(scene));
}

/**
 * Subscribe to state changes
 * Returns unsubscribe function
 */
export function subscribe(listener: (s: Scene) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get current view settings
 */
export function getView(): View {
  return scene.view;
}

/**
 * Update view settings with partial patch
 */
export function updateView(patch: Partial<View>): void {
  const nextView: View = { ...scene.view, ...patch };
  update({ view: nextView });
}

/**
 * Get current viewport settings
 */
export function getViewport(): Viewport {
  return scene.viewport;
}

/**
 * Update viewport settings
 */
export function updateViewport(patch: Partial<Viewport>): void {
  const nextViewport: Viewport = { ...scene.viewport, ...patch };
  update({ viewport: nextViewport });
}

/**
 * Load complete scene (replaces current scene state)
 * Notifies all subscribers
 */
export function loadScene(newScene: Scene): void {
  scene = newScene;
  ensureUploadedSymbol(newScene.shape);
  listeners.forEach((l) => l(scene));
}

