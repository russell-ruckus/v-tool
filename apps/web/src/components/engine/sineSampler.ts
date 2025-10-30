/**
 * Sine path sampler for wavy instance distribution
 * Generates deterministic instance positions along a sine wave
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along a sine wave path
 * Returns positions oscillating vertically while moving horizontally
 */
export function sampleSinePath(distribution: PathDistribution): Instance[] {
  const { instances, frequency = 1.0, amplitude = 50 } = distribution.path;
  const result: Instance[] = [];

  // For MVP: horizontal line from -300 to 300 (600px span)
  const startX = -300;
  const endX = 300;
  const centerY = 0; // Center vertically

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1

    // Calculate x position (evenly distributed)
    const x = startX + t * (endX - startX);

    // Calculate y position using sine wave
    const sineValue = Math.sin(2 * Math.PI * frequency * t);
    const y = centerY + amplitude * sineValue;

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

