/**
 * Validation utilities for scene configuration
 * Provides seed validation and deterministic layout generation
 */
import type { Scene, Instance } from '@v-tool/shared';
import { sampleDistribution } from '../components/engine/sampler';
import { applySpacing } from '../utils/spacing';
import { applyDepthToScale, applyRotation, sortByDepth } from '../utils/transforms';

/**
 * Validate seed value is within acceptable range
 * Seeds must be non-negative integers in range [0, 999999]
 */
export function validateSeed(scene: Scene): boolean {
  const seed = scene.rng.seed;
  return Number.isInteger(seed) && seed >= 0 && seed <= 999999;
}

/**
 * Generate deterministic layout from scene configuration
 * Uses seeded RNG for all random operations to ensure reproducibility
 * 
 * This is the canonical function for generating instance layouts.
 * Same scene configuration (including seed) always produces identical output.
 */
export function generateDeterministicLayout(scene: Scene): Instance[] {
  // Sample instances based on distribution mode
  let instances: Instance[] = [];

  if (scene.distribution.mode === 'path') {
    // Path distributions use sampler and apply spacing
    instances = sampleDistribution(scene);

    // Apply spacing function
    const spacedPositions = applySpacing(
      instances.map((i) => ({ x: i.x, y: i.y })),
      scene.distribution.spacing
    );

    // Update x positions with spaced values
    instances = instances.map((inst, i) => ({
      ...inst,
      x: spacedPositions[i].x,
    }));
  } else if (scene.distribution.mode === 'particle') {
    // Particle distributions don't use spacing functions
    instances = sampleDistribution(scene);
  }

  // Apply transforms
  instances = applyDepthToScale(instances, scene.transform);
  instances = applyRotation(instances, scene.transform, scene.rng.seed);

  // Sort by depth if enabled
  if (scene.transform.sortByDepth) {
    instances = sortByDepth(instances);
  }

  return instances;
}
