/**
 * Spiral path sampler for archimedean spiral distributions
 * Generates deterministic instance positions along a spiral path
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along a spiral path
 * Returns positions following an Archimedean spiral
 */
export function sampleSpiralPath(distribution: PathDistribution): Instance[] {
  const { instances, spiralTurns = 3, spiralRadius = 200 } = distribution.path;
  const result: Instance[] = [];

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    // Archimedean spiral: r = a * θ, where θ ranges from 0 to turns * 2π
    const theta = t * spiralTurns * 2 * Math.PI;
    const radius = t * spiralRadius;
    
    // Convert polar to cartesian
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

