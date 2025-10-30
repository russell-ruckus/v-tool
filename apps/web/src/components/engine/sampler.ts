/**
 * Unified distribution sampler dispatcher
 * Routes to appropriate sampler based on distribution type
 */
import type { PathDistribution, Instance, Scene } from '@v-tool/shared';
import { sampleLinearPath } from './pathSampler';
import { sampleSinePath } from './sineSampler';
import { sampleBezierPath } from './bezierSampler';
import { sampleParametricPath } from './parametricSampler';
import { sampleSpiralPath } from './spiralSampler';
import { sampleEllipsePath } from './ellipseSampler';
import { samplePolygonPath } from './polygonSampler';
import { sampleArcPath } from './arcSampler';
import { sampleGridJitter } from './gridSampler';
import { sampleRandomScatter } from './scatterSampler';

/**
 * Unified distribution sampler dispatcher
 * Routes to appropriate sampler based on distribution mode and type
 */
export function sampleDistribution(scene: Scene): Instance[] {
  const { distribution } = scene;
  
  if (distribution.mode === 'path') {
    if (distribution.path.type === 'linear') {
      return sampleLinearPath(distribution);
    } else if (distribution.path.type === 'sine') {
      return sampleSinePath(distribution);
    } else if (distribution.path.type === 'bezier') {
      return sampleBezierPath(distribution);
    } else if (distribution.path.type === 'parametric') {
      return sampleParametricPath(distribution);
    } else if (distribution.path.type === 'spiral') {
      return sampleSpiralPath(distribution);
    } else if (distribution.path.type === 'ellipse') {
      return sampleEllipsePath(distribution);
    } else if (distribution.path.type === 'polygon') {
      return samplePolygonPath(distribution);
    } else if (distribution.path.type === 'arc') {
      return sampleArcPath(distribution);
    }
    // Fallback to linear path
    return sampleLinearPath(distribution);
  } else if (distribution.mode === 'particle') {
    if (distribution.particle.type === 'grid') {
      return sampleGridJitter(distribution.particle, scene.rng.seed);
    } else if (distribution.particle.type === 'random') {
      return sampleRandomScatter(distribution.particle, scene.rng.seed);
    }
    // Fallback to empty array for unknown particle types
    return [];
  }
  
  // Ultimate fallback to linear path
  return sampleLinearPath(distribution as PathDistribution);
}

// Export individual samplers for backward compatibility and testing
export { sampleLinearPath } from './pathSampler';
export { sampleSinePath } from './sineSampler';
export { sampleBezierPath } from './bezierSampler';
export { sampleParametricPath } from './parametricSampler';
export { sampleSpiralPath } from './spiralSampler';
export { sampleEllipsePath } from './ellipseSampler';
export { samplePolygonPath } from './polygonSampler';
export { sampleArcPath } from './arcSampler';
export { sampleGridJitter } from './gridSampler';
export { sampleRandomScatter } from './scatterSampler';

// Legacy export for backward compatibility
export function samplePath(distribution: PathDistribution): Instance[] {
  if (distribution.path.type === 'linear') {
    return sampleLinearPath(distribution);
  } else if (distribution.path.type === 'sine') {
    return sampleSinePath(distribution);
  } else if (distribution.path.type === 'bezier') {
    return sampleBezierPath(distribution);
  } else if (distribution.path.type === 'parametric') {
    return sampleParametricPath(distribution);
  } else if (distribution.path.type === 'spiral') {
    return sampleSpiralPath(distribution);
  } else if (distribution.path.type === 'ellipse') {
    return sampleEllipsePath(distribution);
  } else if (distribution.path.type === 'polygon') {
    return samplePolygonPath(distribution);
  } else if (distribution.path.type === 'arc') {
    return sampleArcPath(distribution);
  }
  return sampleLinearPath(distribution);
}
