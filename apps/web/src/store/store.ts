/**
 * Global state management store
 * Observable pattern for reactive updates
 */
import type { Scene } from '@v-tool/shared';

let scene: Scene;
const listeners = new Set<(s: Scene) => void>();

/**
 * Initialize store with initial scene
 */
export function init(initial: Scene): void {
  scene = initial;
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

