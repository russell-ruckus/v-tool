/**
 * Bezier curve path sampler for smooth curved instance distribution
 * Generates deterministic instance positions along a cubic Bezier curve
 */
import type { PathDistribution, Instance } from '@v-tool/shared';

/**
 * Sample instances along a cubic Bezier path
 * Returns positions following a smooth curve
 */
export function sampleBezierPath(distribution: PathDistribution): Instance[] {
  const { instances } = distribution.path;
  const result: Instance[] = [];

  // Default control points: start at left, curve up, then down, end at right
  const defaultCtrlPoints = [
    { x: -300, y: 0 },      // Start point
    { x: -100, y: -100 },   // First control point
    { x: 100, y: 100 },     // Second control point
    { x: 300, y: 0 },       // End point
  ];

  const ctrlPoints = distribution.path.ctrlPoints ?? defaultCtrlPoints;

  // Ensure we have exactly 4 points for cubic Bezier
  if (ctrlPoints.length !== 4) {
    throw new Error('Bezier path requires exactly 4 control points');
  }

  const [p0, p1, p2, p3] = ctrlPoints;

  for (let i = 0; i < instances; i++) {
    const t = instances > 1 ? i / (instances - 1) : 0.5; // normalize to 0-1
    
    // Cubic Bezier formula: (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const oneMinusT = 1 - t;
    const t2 = t * t;
    const t3 = t2 * t;
    const oneMinusT2 = oneMinusT * oneMinusT;
    const oneMinusT3 = oneMinusT2 * oneMinusT;

    const x = oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x;
    const y = oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y;

    result.push({
      x,
      y,
      rotation: 0,
      depth: t, // Normalized position = depth
    });
  }

  return result;
}

