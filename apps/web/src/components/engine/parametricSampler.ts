/**
 * Parametric equation path sampler for custom mathematical distributions
 * Generates deterministic instance positions based on parametric equations
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along a parametric path
 * Returns positions evaluated from parametric equations
 */
export function sampleParametricPath(distribution: PathDistribution): Instance[] {
  const { instances, frequency = 1.0, parametricX, parametricY } = distribution.path;
  const result: Instance[] = [];

  // Default parametric equations if not provided
  const defaultX = 't * 600 - 300';
  const defaultY = 'Math.sin(t * 2 * Math.PI * frequency) * 50';

  const xEquation = parametricX ?? defaultX;
  const yEquation = parametricY ?? defaultY;

  // Create a safe evaluation context
  const evalContext = {
    t: 0,
    frequency: frequency,
    Math: Math,
    // Pre-calculated constants for common use
    PI: Math.PI,
  };

  // Try to create a function from the equation string
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  let evaluateX: ((t: number, freq: number) => number) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  let evaluateY: ((t: number, freq: number) => number) | null = null;

  try {
    // Create function from equation
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    evaluateX = new Function('t', 'frequency', `return ${xEquation};`) as (t: number, freq: number) => number;
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    evaluateY = new Function('t', 'frequency', `return ${yEquation};`) as (t: number, freq: number) => number;
  } catch (error) {
    console.error('Error creating parametric functions:', error);
    // Fallback to default linear path
    return sampleLinearFallback(instances);
  }

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    let x: number;
    let y: number;

    try {
      x = evaluateX(t, frequency);
      y = evaluateY(t, frequency);
    } catch (error) {
      console.error(`Error evaluating parametric equation at t=${t}:`, error);
      // Fallback to linear positioning
      const startX = -300;
      const endX = 300;
      x = startX + t * (endX - startX);
      y = 0;
    }

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
 * Fallback to linear path if parametric evaluation fails
 */
function sampleLinearFallback(instances: number): Instance[] {
  const result: Instance[] = [];
  const startX = -300;
  const endX = 300;
  const y = 0;

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5;
    const x = startX + t * (endX - startX);

    result.push({
      x,
      y,
      rotation: 0,
      depth: t,
    });
  }

  return result;
}

