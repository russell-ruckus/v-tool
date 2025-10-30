/**
 * Path sampler for instance distribution
 * Generates deterministic instance positions along paths
 */
import type { PathDistribution, Instance } from '@v-tool/shared';
import { sampleSinePath } from './sineSampler';

/**
 * Sample instances along a linear path
 * Returns evenly distributed positions
 */
export function sampleLinearPath(distribution: PathDistribution): Instance[] {
  const { instances } = distribution.path;
  const result: Instance[] = [];

  // For MVP: horizontal line from -300 to 300 (600px span)
  const startX = -300;
  const endX = 300;
  const y = 0; // Center vertically

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    const x = startX + t * (endX - startX);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

/**
 * Unified path sampler dispatcher
 * Routes to appropriate sampler based on path type
 */
export function samplePath(distribution: PathDistribution): Instance[] {
  if (distribution.path.type === 'linear') {
    return sampleLinearPath(distribution);
  } else if (distribution.path.type === 'sine') {
    return sampleSinePath(distribution);
  }

  // Fallback to linear for safety
  return sampleLinearPath(distribution);
}
