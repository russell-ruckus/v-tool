/**
 * Transform utilities for depth→scale mapping, rotation, and sorting
 * Applies visual transforms to instances based on Transform configuration
 */
import type { Instance, Transform } from '@v-tool/shared';
import { seedRNG, randomBetween } from './rng';

/**
 * Apply depth→scale mapping to instances
 * Maps instance depth values to scale values using linear interpolation
 */
export function applyDepthToScale(
  instances: Instance[],
  transform: Transform
): Instance[] {
  const [depthMin, depthMax] = transform.depthRange;
  const [scaleMin, scaleMax] = transform.scaleRange;
  
  return instances.map(inst => {
    // Normalize depth to [0, 1] range
    const normalizedDepth = Math.max(0, Math.min(1, 
      (inst.depth - depthMin) / (depthMax - depthMin || 1)
    ));
    
    // Calculate scale from normalized depth
    const scale = scaleMin + normalizedDepth * (scaleMax - scaleMin);
    
    return {
      ...inst,
      scale,
    };
  });
}

/**
 * Apply rotation transforms to instances
 * Supports both fixed rotation and randomized range (seeded)
 */
export function applyRotation(
  instances: Instance[],
  transform: Transform,
  seed: number
): Instance[] {
  const { rotation } = transform;
  
  if (rotation.mode === 'fixed') {
    // Apply fixed rotation to all instances
    return instances.map(inst => ({
      ...inst,
      rotation: rotation.value ?? 0,
    }));
  } else {
    // Apply random rotation within range
    const rng = seedRNG(seed);
    return instances.map(inst => ({
      ...inst,
      rotation: randomBetween(rotation.min ?? 0, rotation.max ?? 360, rng),
    }));
  }
}

/**
 * Sort instances by depth for render ordering
 * Creates shallow copy to avoid mutating original array
 */
export function sortByDepth(instances: Instance[]): Instance[] {
  return [...instances].sort((a, b) => a.depth - b.depth);
}
