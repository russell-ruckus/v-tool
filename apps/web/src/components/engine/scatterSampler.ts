/**
 * Random scatter sampler for particle distribution
 * Generates deterministic random instance positions across canvas
 */
import type { RandomScatter, Instance } from '@v-tool/shared';
import { seedRNG, randomBetween } from '../../utils/rng';

/**
 * Sample instances in random scatter pattern
 * Returns positions randomly distributed across canvas
 */
export function sampleRandomScatter(
  scatter: RandomScatter,
  seed: number
): Instance[] {
  const { density } = scatter;
  
  // Calculate instance count based on density (same formula as grid)
  // Canvas size: -400 to 400 (x), -300 to 300 (y) = 800x600 units
  const canvasArea = 800 * 600; // units²
  const instances = Math.floor(density * (canvasArea / 10000));
  
  if (instances === 0) return [];
  
  // Generate random positions
  const result: Instance[] = [];
  const rng = seedRNG(seed);
  
  // Canvas bounds
  const minX = -400;
  const maxX = 400;
  const minY = -300;
  const maxY = 300;
  
  for (let i = 0; i < instances; i++) {
    result.push({
      x: randomBetween(minX, maxX, rng),
      y: randomBetween(minY, maxY, rng),
      rotation: 0,
      depth: randomBetween(0, 1, rng), // Random depth for particles
    });
  }
  
  return result;
}
