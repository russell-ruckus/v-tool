/**
 * Polygon path sampler for regular polygon instance distributions
 * Generates deterministic instance positions along a regular polygon perimeter
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along a polygon path
 * Returns positions evenly distributed around the polygon perimeter
 */
export function samplePolygonPath(distribution: PathDistribution): Instance[] {
  const { instances, polygonSides = 6, polygonRadius = 200 } = distribution.path;
  const result: Instance[] = [];

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    // Parameterize polygon: angle from 0 to 2π
    const theta = t * 2 * Math.PI;
    
    // Place on circle (regular polygon is inscribed in a circle)
    const x = polygonRadius * Math.cos(theta);
    const y = polygonRadius * Math.sin(theta);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

