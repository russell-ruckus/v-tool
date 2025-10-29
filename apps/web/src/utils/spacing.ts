/**
 * Spacing functions for instance distribution
 * Transforms linear positions with easing functions
 */
import type { SpacingFn } from '@v-tool/shared';

/**
 * Apply spacing function to positions
 */
export function applySpacing(
  positions: Array<{ x: number; y: number }>,
  spacing: SpacingFn
): Array<{ x: number; y: number }> {
  if (spacing === 'linear') {
    return positions; // no transformation
  }

  return positions.map((pos, i) => {
    const t = positions.length > 1 ? i / (positions.length - 1) : 0.5;
    let easedT: number;

    if (spacing === 'ease-in') {
      easedT = easeInQuad(t);
    } else if (spacing === 'ease-out') {
      easedT = easeOutQuad(t);
    } else {
      easedT = t;
    }

    // Re-map eased position along original span
    const startX = positions[0].x;
    const endX = positions[positions.length - 1].x;
    const span = endX - startX;

    return {
      x: startX + easedT * span,
      y: pos.y, // maintain y position
    };
  });
}

/**
 * Ease-in quadratic function
 * Slow start, fast end
 */
function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Ease-out quadratic function
 * Fast start, slow end
 */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

