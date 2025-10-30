/**
 * Preset service
 * Handles saving/loading presets to localStorage
 */
import type { Scene } from '@v-tool/shared';

const PRESET_KEY_PREFIX = 'preset:';

/**
 * Get localStorage key for preset
 */
function getPresetKey(name: string): string {
  return `${PRESET_KEY_PREFIX}${name}`;
}

/**
 * Extract preset name from localStorage key
 */
function extractPresetName(key: string): string | null {
  if (!key.startsWith(PRESET_KEY_PREFIX)) {
    return null;
  }
  return key.substring(PRESET_KEY_PREFIX.length);
}

/**
 * Validate preset name
 */
function validatePresetName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * Save preset to localStorage
 * @throws {Error} if localStorage quota exceeded or invalid preset name
 */
export function savePreset(name: string, scene: Scene): void {
  if (!validatePresetName(name)) {
    throw new Error('Preset name cannot be empty');
  }

  const key = getPresetKey(name);
  const serialized = JSON.stringify(scene);

  try {
    localStorage.setItem(key, serialized);
  } catch (error) {
    const name = (error as { name?: string; message?: string }).name;
    const message = (error as { name?: string; message?: string }).message || '';
    if (name === 'QuotaExceededError' || message.includes('QuotaExceeded')) {
      throw new Error('Storage quota exceeded. Please delete some presets and try again.');
    }
    throw error;
  }
}

/**
 * Load preset from localStorage
 * Returns null if preset doesn't exist or is corrupted
 */
export function loadPreset(name: string): Scene | null {
  if (!validatePresetName(name)) {
    return null;
  }

  const key = getPresetKey(name);
  const stored = localStorage.getItem(key);

  if (!stored) {
    return null;
  }

  try {
    const scene = JSON.parse(stored) as Scene;
    // Basic validation - check for required Scene properties
    if (
      scene &&
      typeof scene === 'object' &&
      scene.id &&
      scene.version &&
      scene.rng &&
      scene.shape &&
      scene.distribution &&
      scene.transform &&
      scene.style &&
      scene.view &&
      scene.viewport &&
      scene.export
    ) {
      return scene;
    }
    return null;
  } catch (error) {
    // Corrupted preset data
    console.warn(`Preset "${name}" contains invalid data and will be ignored.`, error);
    return null;
  }
}

/**
 * List all preset names
 */
export function listPresets(): string[] {
  const presets: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const presetName = extractPresetName(key);
      if (presetName !== null) {
        presets.push(presetName);
      }
    }
  }

  return presets.sort();
}

/**
 * Delete preset from localStorage
 */
export function deletePreset(name: string): void {
  if (!validatePresetName(name)) {
    throw new Error('Preset name cannot be empty');
  }

  const key = getPresetKey(name);
  localStorage.removeItem(key);
}

/**
 * Rename preset
 * Returns false if new name already exists
 * @throws {Error} if preset doesn't exist or invalid names
 */
export function renamePreset(oldName: string, newName: string): boolean {
  if (!validatePresetName(oldName) || !validatePresetName(newName)) {
    throw new Error('Preset names cannot be empty');
  }

  if (oldName === newName) {
    return true; // No-op if names are the same
  }

  // Check if new name already exists
  const existingPreset = loadPreset(newName);
  if (existingPreset !== null) {
    return false;
  }

  // Load old preset
  const scene = loadPreset(oldName);
  if (scene === null) {
    throw new Error(`Preset "${oldName}" does not exist`);
  }

  // Save to new name
  savePreset(newName, scene);

  // Delete old preset
  deletePreset(oldName);

  return true;
}

