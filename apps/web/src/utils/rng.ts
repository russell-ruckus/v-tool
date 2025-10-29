/**
 * Deterministic random number generator
 * Uses Linear Congruential Generator (LCG) for reproducibility
 */

/**
 * Create a seeded RNG function
 * Same seed produces same sequence
 */
export function seedRNG(seed: number): () => number {
  let state = seed;
  return () => {
    // LCG parameters from Numerical Recipes
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32; // normalize to 0-1
  };
}

/**
 * Generate random number between min and max
 */
export function randomBetween(min: number, max: number, rng: () => number): number {
  return min + (max - min) * rng();
}

