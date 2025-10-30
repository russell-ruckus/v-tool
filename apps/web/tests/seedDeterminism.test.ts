import { describe, it, expect } from 'vitest';
import { createTestScene } from './testHelpers';
import { generateDeterministicLayout, validateSeed } from '../src/services/validation';

describe('Seed determinism', () => {
  it('validateSeed accepts integer seeds in range', () => {
    expect(validateSeed(createTestScene({ rng: { seed: 0 } }))).toBe(true);
    expect(validateSeed(createTestScene({ rng: { seed: 999999 } }))).toBe(true);
    // @ts-expect-error purposefully invalid
    expect(validateSeed(createTestScene({ rng: { seed: -1 } as any }))).toBe(false);
  });

  it('same seed + same params produces identical instance arrays', () => {
    const scene1 = createTestScene({ rng: { seed: 12345 } });
    const scene2 = createTestScene({ rng: { seed: 12345 } });
    const result1 = generateDeterministicLayout(scene1);
    const result2 = generateDeterministicLayout(scene2);
    expect(result1).toEqual(result2);
  });

  it('different seeds produce different instance arrays', () => {
    // Use particle mode with random scatter to exercise seeded randomness
    const scene1 = createTestScene({ 
      rng: { seed: 11111 },
      distribution: {
        mode: 'particle',
        particle: { type: 'random', density: 20 }
      }
    });
    const scene2 = createTestScene({ 
      rng: { seed: 22222 },
      distribution: {
        mode: 'particle',
        particle: { type: 'random', density: 20 }
      }
    });
    const result1 = generateDeterministicLayout(scene1);
    const result2 = generateDeterministicLayout(scene2);
    expect(result1).not.toEqual(result2);
  });

  it('changing seed results in deterministic but different output', () => {
    // Use particle mode with grid jitter to exercise seeded randomness
    const base = createTestScene({ 
      rng: { seed: 33333 },
      distribution: {
        mode: 'particle',
        particle: { type: 'grid', density: 20, jitter: 0.5 }
      }
    });
    const result1 = generateDeterministicLayout(base);
    const changed = createTestScene({ 
      rng: { seed: 44444 },
      distribution: {
        mode: 'particle',
        particle: { type: 'grid', density: 20, jitter: 0.5 }
      }
    });
    const result2 = generateDeterministicLayout(changed);
    expect(result1).not.toEqual(result2);
  });
});


