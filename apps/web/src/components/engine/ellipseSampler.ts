/**
 * Ellipse path sampler for elliptical instance distributions
 * Generates deterministic instance positions along an ellipse perimeter
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along an ellipse path
 * Returns positions evenly distributed around the ellipse perimeter
 */
export function sampleEllipsePath(distribution: PathDistribution): Instance[] {
  const { instances, ellipseRadiusX = 250, ellipseRadiusY = 150 } = distribution.path;
  const result: Instance[] = [];

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    // Parameterize ellipse: angle from 0 to 2π
    const theta = t * 2 * Math.PI;
    
    // Ellipse equation: (x/a)² + (y/b)² = 1
    const x = ellipseRadiusX * Math.cos(theta);
    const y = ellipseRadiusY * Math.sin(theta);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

