/**
 * Grid jitter sampler for particle distribution
 * Generates deterministic instance positions in a jittered grid
 */
import type { GridJitter, Instance } from '@v-tool/shared';
import { seedRNG, randomBetween } from '../../utils/rng';

/**
 * Sample instances in a jittered grid pattern
 * Returns positions arranged in a grid with optional jitter
 */
export function sampleGridJitter(
  grid: GridJitter,
  seed: number
): Instance[] {
  const { density, jitter } = grid;
  
  // Calculate instance count based on density
  // Canvas size: -400 to 400 (x), -300 to 300 (y) = 800x600 units
  const canvasArea = 800 * 600; // units²
  const instances = Math.floor(density * (canvasArea / 10000));
  
  if (instances === 0) return [];
  
  // Calculate grid dimensions
  const aspectRatio = 800 / 600; // 4:3 aspect ratio
  const columns = Math.ceil(Math.sqrt(instances * aspectRatio));
  const rows = Math.ceil(Math.sqrt(instances / aspectRatio));
  
  // Grid cell size
  const gridX = 800 / columns;
  const gridY = 600 / rows;
  
  // Jitter ranges (half cell size maximum)
  const jitterRangeX = jitter * gridX / 2;
  const jitterRangeY = jitter * gridY / 2;
  
  // Generate instances
  const result: Instance[] = [];
  const rng = seedRNG(seed);
  
  const startX = -400;
  const startY = -300;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (result.length >= instances) break;
      
      // Base grid position (center of cell)
      const baseX = startX + col * gridX + gridX / 2;
      const baseY = startY + row * gridY + gridY / 2;
      
      // Apply jitter
      const offsetX = randomBetween(-jitterRangeX, jitterRangeX, rng);
      const offsetY = randomBetween(-jitterRangeY, jitterRangeY, rng);
      
      result.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
        rotation: 0,
        depth: randomBetween(0, 1, rng), // Random depth for particles
      });
    }
    
    // Break outer loop if we have enough instances
    if (result.length >= instances) break;
  }
  
  return result;
}
