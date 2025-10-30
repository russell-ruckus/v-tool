/**
 * Arc path sampler for circular arc instance distributions
 * Generates deterministic instance positions along a circular arc
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along an arc path
 * Returns positions along a circular arc segment
 */
export function sampleArcPath(distribution: PathDistribution): Instance[] {
  const { instances, arcStartAngle = 0, arcEndAngle = 180, arcRadius = 200 } = distribution.path;
  const result: Instance[] = [];

  // Convert degrees to radians
  const startRad = (arcStartAngle * Math.PI) / 180;
  const endRad = (arcEndAngle * Math.PI) / 180;
  const range = endRad - startRad;

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    // Parameterize arc: angle from startAngle to endAngle
    const theta = startRad + t * range;
    
    // Arc on circle
    const x = arcRadius * Math.cos(theta);
    const y = arcRadius * Math.sin(theta);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

